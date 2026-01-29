var citizen = require('../../index'),
    pause_duration_ms = 1000;

citizen.hook.add( 'citizen-mail', 'handle-pause-requests', function( envelope, handle_mail ){
  if( ! envelope.msg || typeof envelope.msg !== 'string' ) return;
  if( envelope.msg.toUpperCase() !== 'PAUSE' ) return;

  var ack = handle_mail();

  citizen.mail.pause();
  citizen.mail.send({ pause_for: pause_duration_ms, paused_at: Date.now() });

  setTimeout( citizen.mail.receive, pause_duration_ms );

  ack();
});

citizen.hook.add( 'citizen-mail', 'handle-nonpause-requests', function( envelope, handle_mail ){
  var ack = handle_mail();

  citizen.mail.send({ received: envelope.msg, received_at: Date.now() });
  ack();
});

citizen.mail.receive();

// wait ten secs before shutting down
  setTimeout( process.exit, 10000 );