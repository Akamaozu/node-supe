var current_receive_callback,
    setup_listener = false;

module.exports = function( citizen, config ){

  if( !setup_listener ){

    process.on( 'message', function( envelope ){

      if( !envelope.type || envelope.type !== 'mail' ) return;
      if( typeof current_receive_callback !== 'function' ) return;

      current_receive_callback( envelope, function(){ citizen.signal.send( 'ACK-CURRENT-MAIL' ); } );
    });

    setup_listener = true;
  }

  citizen.mail.receive = function receive_mail( receive_callback ){

    if( !current_receive_callback && ( !receive_callback || typeof receive_callback !== 'function' ) ) throw new Error( 'mail.receive requires a function to pass received messages to' );

    if( receive_callback && typeof receive_callback === 'function' ) current_receive_callback = receive_callback;

    citizen.signal.send( 'READY-TO-RECEIVE-MAIL' );
  }
}