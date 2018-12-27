var send_next_mail = require( './actions/send-next-mail' ),
    start_waiting_for_mail = require( './actions/start-waiting-for-mail' );

module.exports = function( supervisor, config ){

  supervisor.hook.add( 'citizen-mail-unpaused', 'send-next-mail-if-any', send_next_mail_if_any );
  supervisor.hook.add( 'citizen-current-mail-acked', 'send-next-mail-if-any', send_next_mail_if_any );

  function send_next_mail_if_any( details ){
    var citizen_name = details.citizen,
        citizen = supervisor.get( citizen_name );

    if( citizen.state.pause_mail ) return;

    if( citizen.mail.inbox.length > 0 ) send_next_mail( supervisor, citizen );
    else start_waiting_for_mail( supervisor, citizen );
  }
}