var signal = require('./supervised-send-signal'),
    merge = require('merge-objects'),
    current_receive_callback,
    is_setup = false;

module.exports = {
  
  send: send_mail,
  pause: pause_mail,
  receive: receive_mail
};

function receive_mail( receive_callback ){

  if( !current_receive_callback && ( !receive_callback || typeof receive_callback !== 'function' ) ) throw new Error( 'mail.receive requires a function to pass received messages to' );

  if( receive_callback && typeof receive_callback === 'function' ) current_receive_callback = receive_callback;

  if( !is_setup ){

    process.on( 'message', function( envelope ){

      if( !envelope.type || envelope.type !== 'mail' ) return;

      current_receive_callback( envelope, function(){ signal( 'ACK-CURRENT-MAIL' ); } );
    });

    is_setup = true;
  }

  signal( 'READY-TO-RECEIVE-MAIL' );
}

function send_mail( settings, msg ){

  if( !msg ){

    msg = settings;
    settings = {};
  }

  var envelope = merge({ type: 'mail' }, settings );

  envelope.msg = msg;

  process.send( envelope );
}

function pause_mail(){

  signal( 'NOT-READY-TO-RECEIVE-MAIL' );
}