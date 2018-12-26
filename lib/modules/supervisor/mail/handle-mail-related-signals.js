var pause_mail = require( './actions/pause-mail' ),
    unpause_mail = require( './actions/unpause-mail' ),
    send_next_mail = require( './actions/send-next-mail' ),
    ack_current_mail = require( './actions/ack-current-mail' ),
    start_waiting_for_mail = require( './actions/start-waiting-for-mail' );

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

        unpause_mail( supervisor, citizen );

        if( citizen.mail.inbox.length > 0 ) send_next_mail( supervisor, citizen );
        else start_waiting_for_mail( supervisor, citizen );

        success = true;

      break;

      case 'ACK-CURRENT-MAIL':
        if( ! citizen.state.current_mail ){
          error = 'citizen does not have any mail to acknowledge';
          break;
        }

        ack_current_mail( supervisor, citizen );

        if( ! citizen.state.pause_mail ){
          if( citizen.mail.inbox.length > 0 ) send_next_mail( supervisor, citizen );
          else start_waiting_for_mail( supervisor, citizen );
        }

        success = true;
      break;

      case 'NOT-READY-TO-RECEIVE-MAIL':
        pause_mail( supervisor, citizen );
        success = true;
      break;

      default:
        return; // not a citizen signal -- bail
      break;
    }

    if( ! success ) console.log({ action: action, signal: signal, from: from, success: success, error: error });
  });
}