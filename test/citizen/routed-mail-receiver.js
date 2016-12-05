var supe = require('../../index');

supe.mail.receive( function( envelope, ack ){

  if( envelope.from ) supe.mail.send({ received_mail_from: envelope.from });
  ack();
});

// wait ten secs before shutting down
setTimeout( process.exit, 10000 );