module.exports = function( supervisor ){
  
  supervisor.hook.add( 'citizen-signal', 'handle-mail-related-signals', function( envelope ){
    if( !envelope || !envelope.from || !envelope.signal ) return;

    var action = 'handle-mail-related-signals',
        signal = envelope.signal,
        from = envelope.from,
        success = false,
        error;

    var citizen = supervisor.get( envelope.from );
    if( ! citizen ) return console.log({ action: action, signal: signal, from: from, success: success, error: 'sender is not a registered citizen' });

    switch( envelope.signal ){

      case 'READY-TO-RECEIVE-MAIL':
        if( citizen.state.current_mail ){
          error = 'citizen "'+ citizen.name + '" already processing mail';
          break;
        }
        
        citizen.state.pause_mail = false;

        if( citizen.mail.inbox.length > 0 ){
          citizen.state.current_mail = citizen.mail.inbox.splice( 0, 1 )[0];
          citizen.ref.send( citizen.state.current_mail );
        }

        else citizen_start_waiting_for_mail( citizen );

        success = true;

      break;

      case 'ACK-CURRENT-MAIL':
        if( ! citizen.state.current_mail ){
          error = 'citizen should not have any mail to acknowledge right now';
          break;
        }

        citizen.state.current_mail = null;

        if( ! citizen.state.pause_mail ){
        
          if( citizen.mail.inbox.length > 0 ){
            citizen.state.current_mail = citizen.mail.inbox.splice( 0, 1 )[0];
            citizen.ref.send( citizen.state.current_mail );
          }

          else citizen_start_waiting_for_mail( citizen );
        }

        success = true;
      break;

      case 'NOT-READY-TO-RECEIVE-MAIL':
        citizen.state.pause_mail = true;
        success = true;
      break;

      default:
        return;
      break;
    }

    if( ! success ) console.log({ action: action, signal: signal, from: from, success: success, error: error });
  });

  function citizen_start_waiting_for_mail( citizen ){
    if( citizen.state.waiting_for_mail ) return;

    citizen.state.waiting_for_mail = true;

    supervisor.hook.add( citizen.name + '-inbox-no-longer-empty', 'send-mail-to-ready-citizen', function(){
      supervisor.hook.del( citizen.name + '-inbox-no-longer-empty', 'send-mail-to-ready-citizen' );

      citizen.state.waiting_for_mail = false;
      if( citizen.state.pause_mail ) return;

      citizen.state.current_mail = citizen.mail.inbox.splice( 0, 1 )[0];
      citizen.ref.send( citizen.state.current_mail );
    });
  }
}