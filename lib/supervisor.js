var merge = require('merge-objects'),
    Noticeboard = require('cjs-noticeboard');

module.exports = supe;

function supe( config ){
  
  var citizens = {},
      config = merge({ retries: 3, duration: 3 }, config || {} ),      
      noticeboard = new Noticeboard({ logging: false, logOps: false });

      noticeboard.watch( 'citizen-created', 'pipe-citizen-process-output', function( msg ){

        var name = msg.notice.name,
            citizen = citizens[ name ];

        citizen.ref.stdout.on( 'data', function( data ){

          var output = data.toString();

          noticeboard.notify( name + '-output', { output: output }, name );
          noticeboard.notify( 'citizen-output', { name: name, output: output }, name );
        });

        citizen.ref.stderr.on( 'data', function( data ){

          var error = data.toString();

          noticeboard.notify( name + '-error', { error: error }, name );
          noticeboard.notify( 'citizen-error', { name: name, error: error }, name );
        });
      });

      noticeboard.watch( 'citizen-created', 'notify-on-crash-or-shutdown', function( msg ){

        var name = msg.notice.name,
            citizen = citizens[ name ];

        citizen.ref.on( 'close', function( code ){

          delete citizens[ name ].ref;

          if( code === 0 ){

            noticeboard.notify( name + '-shutdown' );
            noticeboard.notify( 'citizen-shutdown', { name: name });
          }

          else{

            noticeboard.notify( name + '-crashed' );
            noticeboard.notify( 'citizen-crashed', { name: name });
          } 
        });
      });

      noticeboard.watch( 'citizen-created', 'route-citizen-message', function( msg ){

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

          noticeboard.notify( name + '-excessive-crash', { retries: citizen.retries, max_retries: citizen.config.retries });
          noticeboard.notify( 'citizen-excessive-crash', { name: name, retries: citizen.retries, max_retries: citizen.config.retries });

          return;
        }

        start_citizen( name );

        citizen.retries += 1;

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

            noticeboard.notify( 'citizen-signal', { from: envelope.from, signal: envelope.signal }, 'process-supervisor-message' );
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
        }
      });

  return {

    start: start_citizen,

    get: get_citizen,

    noticeboard: noticeboard
  };

  function start_citizen( name, file, params ){

    if( !name ) throw new Error( 'requires a name to refer to supervised process' );
    if( !params ) params = {};

    if( citizens[ name ] ){

      if( file && file !== citizens[ name ].file ) throw new Error( 'process name "' + name + '" is already registered' );

      if( citizens[ name ].ref ) return false;

      file = citizens[ name ].file;
    }

    else {

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
      };
    }

    citizens[ name ].ref = require('child_process').spawn( 'node', [ file ], { stdio: [ 'pipe', 'pipe', 'pipe', 'ipc' ] });

    noticeboard.notify( name + '-created', { citizen: citizens[ name ] });
    noticeboard.notify( 'citizen-created', { name: name, citizen: citizens[ name ] });

    return citizens[ name ];
  }

  function get_citizen( name ){

    if( !name || !citizens[ name ] ) return false;

    return citizens[ name ];
  }
}