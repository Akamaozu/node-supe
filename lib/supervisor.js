var merge = require('merge-objects'),
    Noticeboard = require('cjs-noticeboard');

module.exports = supe;

function supe( config ){
  
  var citizens = {},
      config = merge({ retries: 3, duration: 3 }, config || {} ),      
      noticeboard = new Noticeboard({ logging: false, logOps: false }),
      public_interface = {};

      noticeboard.watch( 'citizen-started', 'pipe-citizen-process-output', function( msg ){

        var name = msg.notice.name,
            citizen = citizens[ name ];

        citizen.ref.stdout.on( 'data', function( data ){

          var output = data.toString();

          noticeboard.notify( 'citizen-output', { name: name, output: output }, name );
          noticeboard.notify( name + '-output', { output: output }, name );
        });

        citizen.ref.stderr.on( 'data', function( data ){

          var error = data.toString();

          noticeboard.notify( 'citizen-error', { name: name, error: error }, name );
          noticeboard.notify( name + '-error', { error: error }, name );
        });
      });

      noticeboard.watch( 'citizen-started', 'notify-on-crash-or-shutdown', function( msg ){

        var name = msg.notice.name,
            citizen = citizens[ name ];

        citizen.ref.on( 'close', function( code ){

          delete citizens[ name ].ref;

          if( code === 0 ){

            noticeboard.notify( 'citizen-shutdown', { name: name });
            noticeboard.notify( name + '-shutdown' );
          }

          else{

            noticeboard.notify( 'citizen-crashed', { name: name });
            noticeboard.notify( name + '-crashed' );
          } 
        });
      });

      noticeboard.watch( 'citizen-started', 'route-citizen-message', function( msg ){

        var name = msg.notice.name,
            citizen = citizens[ name ];

        citizen.ref.on( 'message', function( envelope ){

          envelope.from = name;

          if( !envelope.to ) return noticeboard.notify( 'supervisor-message', envelope, 'supe' );

          var recipient = get_citizen( envelope.to );

          if( !recipient ) return console.log( new Error( 'dropped message from "' + name + '" to "' + envelope.to + '" -- recipient does not exist' ) );

          recipient.mail.inbox.push( envelope );

          if( recipient.mail.inbox.length === 1 ) noticeboard.notify( envelope.to + '-inbox-no-longer-empty' );
        });
      });

      noticeboard.watch( 'citizen-shutdown', 'requeue-unacked-mail', function( msg ){

        var name = msg.notice.name,
            citizen = get_citizen( name );

        if( !citizen.state.current_mail ) return;

        citizen.mail.inbox.splice( 0, 0, citizen.state.current_mail );

        citizen.state.current_mail = null;
      });
      
      noticeboard.watch( 'citizen-crashed', 'requeue-unacked-mail', function( msg ){

        var name = msg.notice.name,
            citizen = get_citizen( name );

        if( !citizen.state.current_mail ) return;

        citizen.mail.inbox.splice( 0, 0, citizen.state.current_mail );

        citizen.state.current_mail = null;
      });

      noticeboard.watch( 'citizen-crashed', 'handle-restart', function( msg ){

        var name = msg.notice.name,
            citizen = get_citizen( name );

        if( !citizen.retries ) citizen.retries = 0;

        if( citizen.retries >= citizen.config.retries ){

          noticeboard.notify( 'citizen-excessive-crash', { name: name, retries: citizen.retries, max_retries: citizen.config.retries, duration: citizen.config.duration });
          noticeboard.notify( name + '-excessive-crash', { retries: citizen.retries, max_retries: citizen.config.retries, duration: citizen.config.duration });

          return;
        }

        start_citizen( name );

        citizen.retries += 1;

          noticeboard.notify( 'citizen-auto-restarted', { name: name, retries: citizen.retries, max_retries: citizen.config.retries, duration: citizen.config.duration });
          noticeboard.notify( name + '-auto-restarted', { retries: citizen.retries, max_retries: citizen.config.retries, duration: citizen.config.duration });

        setTimeout( function(){

          citizen.retries -= 1;
        }, citizen.config.duration * 1000 * 60 );
      });

      noticeboard.watch( 'supervisor-message', 'process-supervisor-message', function( msg ){

        var envelope = msg.notice;

        if( !envelope || !envelope.type ) return;

        if( !envelope.type ) return console.log( '[process-supervisor-message][warn] received message lacks property "type"' );

        switch( envelope.type ){

          case 'signal':

            if( !envelope.signal ) return;

            noticeboard.notify( 'citizen-signal', envelope, 'process-supervisor-message' );
          break;
        }
      });

      noticeboard.watch( 'citizen-signal', 'process-signal', function( msg ){

        var envelope = msg.notice;
        
        if( !envelope || !envelope.from || !envelope.signal ) return;

        switch( envelope.signal ){

          case 'READY-TO-RECEIVE-MAIL':

            var citizen = get_citizen( envelope.from );

            if( !citizen || citizen.state.current_mail ) return;
            
            citizen.state.pause_mail = false;

            if( citizen.mail.inbox.length > 0 ){

              citizen.state.current_mail = citizen.mail.inbox.splice( 0, 1 )[0];

              citizen.ref.send( citizen.state.current_mail );
            }

            else {

              if( citizen.state.waiting_for_mail ) return;

              citizen.state.waiting_for_mail = true;

              noticeboard.once( envelope.from + '-inbox-no-longer-empty', 'send-mail-to-ready-citizen', function( msg ){

                citizen.state.waiting_for_mail = false;

                if( citizen.state.pause_mail ) return;              

                citizen.state.current_mail = citizen.mail.inbox.splice( 0, 1 )[0];

                citizen.ref.send( citizen.state.current_mail );
              });
            }

          break;

          case 'ACK-CURRENT-MAIL':

            var citizen = get_citizen( envelope.from );

            if( !citizen || !citizen.state.current_mail ) return;

            citizen.state.current_mail = null;

            if( citizen.state.pause_mail ) return;
            
            if( citizen.mail.inbox.length > 0 ){

              citizen.state.current_mail = citizen.mail.inbox.splice( 0, 1 )[0];

              citizen.ref.send( citizen.state.current_mail );
            }

            else{

              if( citizen.state.waiting_for_mail ) return;

              citizen.state.waiting_for_mail = true;

              noticeboard.once( envelope.from + '-inbox-no-longer-empty', 'send-mail-to-ready-citizen', function( msg ){

                citizen.state.waiting_for_mail = false;

                if( citizen.state.pause_mail ) return;              

                citizen.state.current_mail = citizen.mail.inbox.splice( 0, 1 )[0];

                citizen.ref.send( citizen.state.current_mail );
              });
            } 

          break;

          case 'NOT-READY-TO-RECEIVE-MAIL':

            var citizen = get_citizen( envelope.from );

            if( !citizen ) return;

            citizen.state.pause_mail = true;            

          break;

          case 'NOTICEBOARD-REQUEST':

            var name = envelope.from,
                citizen = citizens[ name ];

            switch( envelope.data.type ){

              case 'watch':

                var notice = envelope.data.notice,
                    watcher = 'pipe-to-citizen-' + name,
                    opts = envelope.data.opts || {};

                opts.message = { notice: notice, name: name };

                try {

                  noticeboard.watch( notice, watcher, function( msg ){

                    var watcher = msg.watcher,
                        citizen = get_citizen( watcher.name );

                    citizen.ref.send({ type: 'signal', signal: 'NOTICEBOARD-EVENT', data: {

                      type: 'notice', notice: watcher.notice, msg: msg
                    }});

                  }, opts );

                  noticeboard.once( name + '-shutdown' , 'disconnect-' + notice + '-pipes-to-' + name, function( msg ){

                    var details = msg.watcher;
                    
                    noticeboard.ignore( details.notice, 'pipe-to-citizen-' + details.name );
                    noticeboard.ignore( details.name + '-crashed', 'disconnect-' + details.notice + '-pipes-to-' + details.name );

                  }, { message: { name: name, notice: notice }});

                  noticeboard.once( name + '-crashed' , 'disconnect-' + notice + '-pipes-to-' + name, function( msg ){

                    var details = msg.watcher;
                    
                    noticeboard.ignore( details.notice, 'pipe-to-citizen-' + details.name );
                    noticeboard.ignore( details.name + '-shutdown', 'disconnect-' + details.notice + '-pipes-to-' + details.name );

                  }, { message: { name: name, notice: notice }});

                  citizen.ref.send({ 
                    type: 'signal', 
                    signal: 'NOTICEBOARD-RESPONSE', 
                    data: { type: 'watch', notice: notice, success: true } 
                  });

                  notice = watcher = name = citizen = opts = null;
                }

                catch( e ){

                  citizen.ref.send({ 
                    type: 'signal', 
                    signal: 'NOTICEBOARD-RESPONSE', 
                    data: { type: 'watch', notice: notice, success: false, error: e.toString() } 
                  });
                }

              break;

              case 'ignore':

                var notice = envelope.data.notice,
                    watcher = 'pipe-to-citizen-' + name,
                    opts = envelope.data.opts || {};

                opts.message = { notice: notice, name: name };

                try {

                  noticeboard.ignore( notice, 'pipe-to-citizen-' + name );
                  noticeboard.ignore( name + '-crashed', 'disconnect-' + notice + '-pipes-to-' + name );
                  noticeboard.ignore( name + '-shutdown', 'disconnect-' + notice + '-pipes-to-' + name );

                  citizen.ref.send({ 
                    type: 'signal', 
                    signal: 'NOTICEBOARD-RESPONSE', 
                    data: { type: 'ignore', notice: notice, success: true } 
                  });

                  notice = watcher = name = citizen = opts = null;
                }

                catch( e ){

                  citizen.ref.send({ 
                    type: 'signal', 
                    signal: 'NOTICEBOARD-RESPONSE', 
                    data: { type: 'watch', notice: notice, success: false, error: e.toString() } 
                  });
                }

              break;

              case 'notify':

                var notice = envelope.data.notice,
                    message = envelope.data.message,
                    source = name + ( envelope.data.source ? '-' + envelope.data.source : '' );

                try {

                  noticeboard.notify( notice, message, source );

                  citizen.ref.send({
                    type: 'signal',
                    signal: 'NOTICEBOARD-RESPONSE',
                    data: { type: 'notify', notice: notice, success: true }
                  });
                }

                catch( e ){ 

                  citizen.ref.send({ 
                    type: 'signal', 
                    signal: 'NOTICEBOARD-RESPONSE', 
                    data: { type: 'notify', notice: notice, success: false, error: e.toString() } 
                  });
                }

              break;
            }
          break;
        }
      });

  public_interface.noticeboard = noticeboard;

  public_interface.register = register_citizen;
  public_interface.start = start_citizen;
  public_interface.get = get_citizen;

  return public_interface;

  function start_citizen( name, file, params ){

    if( !is_registered_citizen( name ) ){

      var registered = register_citizen( name, file, params );

      if( !registered ) return registered;
    }

    else {

      if( file && file !== citizens[ name ].file ) throw new Error( 'citizen named "' + name + '" already exists' ); 
    }

    citizens[ name ].ref = require('child_process').spawn( 'node', [ citizens[ name ].file ], { stdio: [ 'pipe', 'pipe', 'pipe', 'ipc' ] });

    noticeboard.notify( name + '-started' );
    noticeboard.notify( 'citizen-started', { name: name });

    return citizens[ name ];
  }

  function get_citizen( name ){

    if( !name || !citizens[ name ] ) return false;

    return citizens[ name ];
  }

  function register_citizen( name, file, params ){

    if( !name ) throw new Error( 'requires a name to refer to supervised process' );
    if( !file ) throw new Error( 'requires path to file to run to supervised process' );
    if( typeof name !== 'string' ) throw new Error( 'name must be a string' );
    if( typeof file !== 'string' ) throw new Error( 'path to file must be a string' );

    if( is_registered_citizen( name ) ){

      if( citizens[ name ].file === file ) return citizens[ name ];
      else throw new Error( 'a citizen named "' + name + '" already exists' ); 
    }

    if( !params ) params = {};

    var citizen_config = merge({ retries: config.retries, duration: config.duration }, params );

    citizens[ name ] = {};
    citizens[ name ].logs = [];
    citizens[ name ].file = file;
    citizens[ name ].state = {};
    citizens[ name ].config = citizen_config;
    
    citizens[ name ].mail = {};
    citizens[ name ].mail.inbox = [];
    citizens[ name ].mail.send = function send_mail( settings, msg ){

      if( !msg ){

        msg = settings;
        settings = {};
      }

      var envelope = merge({ from: 'supe', type: 'mail' }, settings );

      envelope.msg = msg;

      citizens[ name ].mail.inbox.push( envelope );

      if( citizens[ name ].mail.inbox.length === 1 ) noticeboard.notify( name + '-inbox-no-longer-empty' );
    };

    noticeboard.notify( 'citizen-registered', { name: name });
    noticeboard.notify( name + '-registered' );

    return citizens[ name ];
  }

  function is_registered_citizen( name ){

    if( typeof name !== 'string' ) return false;

    return citizens.hasOwnProperty( name );
  }

  function load_module( loader ){

    if( !loader ) return;
    if( typeof loader != 'function' ) throw new Error( 'module loader must be a function' );

    loader( public_interface, config );
  }
}