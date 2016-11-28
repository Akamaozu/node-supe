var signal = require('./supervised-send-signal');

module.exports = {
  
  send: send_mail,

  pause: pause_mail,

  receive: function(){

    var current_receive_callback;

    return function receive_mail( receive_callback ){

      if( !current_receive_callback && ( !receive_callback || typeof receive_callback !== 'function' ) ) throw new Error( 'mail.receive requires a function to pass received messages to' );

      if( receive_callback && typeof receive_callback === 'function' ) current_receive_callback = receive_callback;

      process.on( 'message', function( message ){

        if( !message.type || message.type !== 'mail' ) return;

        current_receive_callback( message.mail, function(){ signal( 'ACK-CURRENT-MAIL' ); } );
      });      

      signal( 'READY-TO-RECEIVE-MAIL' );
    }
  }()
};

function send_mail( settings, msg ){

  if( !msg ){

    msg = settings;
    settings = {};
  }

  var envelope = settings;

  envelope.msg = msg;

  process.send( envelope );
}

function pause_mail(){

  signal( 'NOT-READY-TO-RECEIVE-MAIL' );
}