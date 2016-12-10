var supe = require('../../index');

supe.mail.receive( function( envelope, ack ){

  switch( envelope.msg ){

    case 'pause':
    case 'PAUSE':

      var pause_duration_ms = 3000;

      supe.mail.pause();

      supe.mail.send({ pause_for: pause_duration_ms, paused_at: Date.now() });

      setTimeout( supe.mail.receive, pause_duration_ms );
    break;

    default:

      supe.mail.send({ received: envelope.msg });
    break;
  }

  ack();
});

// wait ten secs before shutting down
  setTimeout( process.exit, 20000 );