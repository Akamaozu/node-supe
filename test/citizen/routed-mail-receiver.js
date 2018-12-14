var citizen = require('../../index');

citizen.hook.add( 'citizen-mail', 'handle-routed-mail', function( envelope, ack ){
  if( ! envelope.from ) console.log({ action: 'handle-routed-mail', success: false, error: 'no sender specified on envelope' });
  else citizen.mail.send({ received_mail_from: envelope.from });

  ack();
});

citizen.mail.receive();

// wait ten secs before shutting down
setTimeout( process.exit, 10000 );