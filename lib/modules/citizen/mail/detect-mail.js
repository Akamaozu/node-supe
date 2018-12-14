module.exports = function( citizen, config ){

  citizen.hook.add( 'supervisor-ipc', 'detect-mail', function( details ){
    if( ! details || ! details.hasOwnProperty( 'data' ) ) return;

    var envelope = details.data;

    if( Object.prototype.toString.call( envelope ) !== '[object Object]' ) return;
    if( ! envelope.hasOwnProperty( 'type' ) ) return;
    if( envelope.type !== 'mail' ) return;

    citizen.hook.run( 'citizen-mail', envelope, ack_current_mail );
    citizen.hook.end();

    function ack_current_mail(){
      citizen.signal.send( 'ACK-CURRENT-MAIL' );
      citizen.hook.end();
    }
  });
}