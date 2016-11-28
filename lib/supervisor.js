module.exports = supe;

function supe( config ){
  
  var merge = require('merge-objects'),
      Noticeboard = require('cjs-noticeboard'),
      
      citizens = {},
      config = merge( config || {}, { retries: 3, duration: 3 }),
      
      noticeboard = new Noticeboard({ logging: false, logOps: false });

      noticeboard.watch( 'citizen-created', 'pipe-citizen-process-output', function( msg ){

        var name = msg.notice,
            citizen = citizens[ name ];

        citizen.ref.stdout.on( 'data', function( data ){

          noticeboard.notify( name + '-output', data, name );
        });

        citizen.ref.stderr.on( 'data', function( data ){

          noticeboard.notify( name + '-error', data, name );
        });
      });

      noticeboard.watch( 'citizen-created', 'notify-on-crash-or-shutdown', function( msg ){

        var name = msg.notice,
            citizen = citizens[ name ];

        citizen.ref.on( 'close', function( code ){

          delete citizens[name].ref;

          if( code === 0 ) return noticeboard.notify( 'citizen-shutdown', name );
          else noticeboard.notify( 'citizen-crashed', name );
        });
      });

      noticeboard.watch( 'citizen-created', 'route-citizen-message', function( msg ){

        var name = msg.notice,
            citizen = citizens[ name ];

        citizen.ref.on( 'message', function( envelope ){

          envelope.from = name;

          if( !envelope.to ) return noticeboard.notify( 'message-for-supervisor', envelope, 'supe' );

          var recipient = get_citizen( envelope.to );

          if( !recipient ) return console.log( new Error( 'dropped message from "' + name + '" to "' + envelope.to + '" -- recipient does not exist' ) );

          recipient.inbox.push( envelope );

          if( recipient.inbox.length === 1 ) noticeboard.notify( envelope.to + '-inbox-no-longer-empty' );
        });
      });

      noticeboard.watch( 'citizen-shutdown', 'requeue-unacked-mail', function( msg ){

        var name = msg.notice,
            citizen = get_citizen( name );

        if( !citizen.state.current_mail ) return;

        citizen.inbox.splice( 0, 0, citizen.state.current_mail );

        citizen.state.current_mail = null;
      });
      
      noticeboard.watch( 'citizen-crashed', 'requeue-unacked-mail', function( msg ){

        var name = msg.notice,
            citizen = get_citizen( name );

        if( !citizen.state.current_mail ) return;

        citizen.inbox.splice( 0, 0, citizen.state.current_mail );

        citizen.state.current_mail = null;
      });

      noticeboard.watch( 'citizen-crashed', 'handle-restart', function( msg ){

        var name = msg.notice,
            citizen = get_citizen( name );

        if( !citizen.retries ) citizen.retries = 0;

        if( citizen.retries >= citizen.config.retries ) return noticeboard.notify( 'citizen-excessive-crash', name );

        start_citizen( name );

        citizen.retries += 1;

        setTimeout( function(){

          citizen.retries -= 1;
        }, config.duration * 1000 * 60 );
      });

      noticeboard.watch( 'message-for-supervisor', 'process-supervisor-message', function( msg ){

        var envelope = msg.notice;

        if( !envelope || !envelope.msg ) return;

        if( !envelope.msg.type ) return console.log( '[process-supervisor-message][warn] received message lacks property "type"' );

        switch( envelope.msg.type ){

          case 'signal':

            if( !envelope.msg.signal ) return;

            noticeboard.notify( 'citizen-signal', { from: envelope.from, signal: envelope.msg.signal }, 'process-supervisor-message' );
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

            if( citizen.inbox.length > 0 ){

              citizen.state.current_mail = citizen.inbox.splice( 0, 1 )[0];

              citizen.ref.send( citizen.state.current_mail );
            }

            else {

              if( citizen.state.waiting_for_mail ) return;

              citizen.state.waiting_for_mail = true;

              noticeboard.once( envelope.from + '-inbox-no-longer-empty', 'send-mail-to-ready-citizen', function( msg ){

                citizen.state.waiting_for_mail = false;

                if( citizen.state.pause_mail ) return;              

                citizen.state.current_mail = citizen.inbox.splice( 0, 1 )[0];

                citizen.ref.send( citizen.state.current_mail );
              });
            }

          break;

          case 'ACK-CURRENT-MAIL':

            var citizen = get_citizen( envelope.from );

            if( !citizen || !citizen.state.current_mail ) return;

            citizen.state.current_mail = null;

            if( citizen.state.pause_mail ) return;
            
            if( citizen.inbox.length > 0 ){

              citizen.state.current_mail = citizen.inbox.splice( 0, 1 )[0];

              citizen.ref.send( citizen.state.current_mail );
            }

            else{

              if( citizen.state.waiting_for_mail ) return;

              citizen.state.waiting_for_mail = true;

              noticeboard.once( envelope.from + '-inbox-no-longer-empty', 'send-mail-to-ready-citizen', function( msg ){

                citizen.state.waiting_for_mail = false;

                if( citizen.state.pause_mail ) return;              

                citizen.state.current_mail = citizen.inbox.splice( 0, 1 )[0];

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

    if( citizens[name] ){

      if( file && file !== citizens[name].file ) throw new Error( 'process name "' + name + '" is already registered' );

      if( citizens[name].ref ) return false;

      file = citizens[name].file;
    }

    else {

      var citizen_config = merge( params, { retries: config.retries, duration: config.duration });

      citizens[name] = {};
      citizens[name].logs = [];
      citizens[name].state = {};
      citizens[name].inbox = [];
      citizens[name].file = file;
      citizens[name].config = citizen_config;
    } 

    citizens[name].ref = require('child_process').spawn( 'node', [ file ], { stdio: [ 'pipe', 'pipe', 'pipe', 'ipc' ] });

    noticeboard.notify( 'citizen-created', name );

    return citizens[ name ];
  }

  function get_citizen( name ){

    if( !name || !citizens[name] ) return false;

    return citizens[name];
  }
}