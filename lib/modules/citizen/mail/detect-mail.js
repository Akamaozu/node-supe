module.exports = function( citizen, config ){

  citizen.hook.add( 'supervisor-ipc', 'detect-mail', function( details ){
    if( ! details || ! details.hasOwnProperty( 'data' ) ) return;

    var envelope = details.data;

    if( Object.prototype.toString.call( envelope ) !== '[object Object]' ) return;
    if( ! envelope.hasOwnProperty( 'type' ) ) return;
    if( envelope.type !== 'mail' ) return;

    var mail_handled = false;

    citizen.hook.run( 'citizen-mail', envelope, ack_current_mail );

    if( ! mail_handled ){
      citizen.hook.run( 'unhandled-citizen-mail', envelope );
      ack_current_mail();
    }

    citizen.hook.end();

    function ack_current_mail(){
      mail_handled = true;

      citizen.signal.send( 'ACK-CURRENT-MAIL' );
      citizen.hook.end();
    }
  });
}