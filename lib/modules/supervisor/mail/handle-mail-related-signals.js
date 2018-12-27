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
        try{
          unpause_mail( supervisor, citizen );
          success = true;
        }

        catch(e){
          error = e.message;
        }
      break;

      case 'ACK-CURRENT-MAIL':
        try{
          ack_current_mail( supervisor, citizen );
          success = true;
        }

        catch(e){
          error = e.message;
        }
      break;

      case 'NOT-READY-TO-RECEIVE-MAIL':
        try{
          pause_mail( supervisor, citizen );
          success = true;
        }

        catch(e){
          error = e.message;
        }
      break;

      default:
        return; // not a citizen signal -- bail
      break;
    }

    if( ! success ) console.log({ action: action, signal: signal, from: from, success: success, error: error });
  });
}