module.exports = function( supervisor, config ){

  supervisor.noticeboard.watch( 'citizen-signal', 'process-signal', function( msg ){

    var envelope = msg.notice;
    
    if( !envelope || !envelope.from || !envelope.signal ) return;

    switch( envelope.signal ){

      case 'READY-TO-RECEIVE-MAIL':

        var citizen = supervisor.get( envelope.from );

        if( !citizen || citizen.state.current_mail ) return;
        
        citizen.state.pause_mail = false;

        if( citizen.mail.inbox.length > 0 ){

          citizen.state.current_mail = citizen.mail.inbox.splice( 0, 1 )[0];

          citizen.ref.send( citizen.state.current_mail );
        }

        else {

          if( citizen.state.waiting_for_mail ) return;

          citizen.state.waiting_for_mail = true;

          supervisor.noticeboard.once( envelope.from + '-inbox-no-longer-empty', 'send-mail-to-ready-citizen', function( msg ){

            citizen.state.waiting_for_mail = false;

            if( citizen.state.pause_mail ) return;              

            citizen.state.current_mail = citizen.mail.inbox.splice( 0, 1 )[0];

            citizen.ref.send( citizen.state.current_mail );
          });
        }

      break;

      case 'ACK-CURRENT-MAIL':

        var citizen = supervisor.get( envelope.from );

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

          supervisor.noticeboard.once( envelope.from + '-inbox-no-longer-empty', 'send-mail-to-ready-citizen', function( msg ){

            citizen.state.waiting_for_mail = false;

            if( citizen.state.pause_mail ) return;              

            citizen.state.current_mail = citizen.mail.inbox.splice( 0, 1 )[0];

            citizen.ref.send( citizen.state.current_mail );
          });
        } 

      break;

      case 'NOT-READY-TO-RECEIVE-MAIL':

        var citizen = supervisor.get( envelope.from );

        if( !citizen ) return;

        citizen.state.pause_mail = true;            

      break;

      case 'NOTICEBOARD-REQUEST':

        var name = envelope.from,
            citizen = supervisor.get( name );

        switch( envelope.data.type ){

          case 'watch':

            var notice = envelope.data.notice,
                watcher = 'pipe-to-citizen-' + name,
                opts = envelope.data.opts || {};

            opts.message = { notice: notice, name: name };

            try {

              supervisor.noticeboard.watch( notice, watcher, function( msg ){

                var watcher = msg.watcher,
                    citizen = supervisor.get( watcher.name );

                citizen.ref.send({ type: 'signal', signal: 'NOTICEBOARD-EVENT', data: {

                  type: 'notice', notice: watcher.notice, msg: msg
                }});

              }, opts );

              supervisor.noticeboard.once( name + '-shutdown' , 'disconnect-' + notice + '-pipes-to-' + name, function( msg ){

                var details = msg.watcher;
                
                supervisor.noticeboard.ignore( details.notice, 'pipe-to-citizen-' + details.name );
                supervisor.noticeboard.ignore( details.name + '-crashed', 'disconnect-' + details.notice + '-pipes-to-' + details.name );

              }, { message: { name: name, notice: notice }});

              supervisor.noticeboard.once( name + '-crashed' , 'disconnect-' + notice + '-pipes-to-' + name, function( msg ){

                var details = msg.watcher;
                
                supervisor.noticeboard.ignore( details.notice, 'pipe-to-citizen-' + details.name );
                supervisor.noticeboard.ignore( details.name + '-shutdown', 'disconnect-' + details.notice + '-pipes-to-' + details.name );

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

              supervisor.noticeboard.ignore( notice, 'pipe-to-citizen-' + name );
              supervisor.noticeboard.ignore( name + '-crashed', 'disconnect-' + notice + '-pipes-to-' + name );
              supervisor.noticeboard.ignore( name + '-shutdown', 'disconnect-' + notice + '-pipes-to-' + name );

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

              supervisor.noticeboard.notify( notice, message, source );

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
}