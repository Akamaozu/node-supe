var citizen = require('../../index');

citizen.hook.add( 'citizen-mail', 'handle-crash-request', function( envelope, ack ){
  if( ! envelope || ! envelope.msg || typeof envelope.msg !== 'string' ) return;
  if( envelope.msg.toUpperCase() !== 'CRASH' ) return;

  throw new Error( 'chaos monkey strikes' );
});

citizen.hook.add( 'citizen-mail', 'handle-shutdown-request', function( envelope, ack ){
  if( ! envelope || ! envelope.msg || typeof envelope.msg !== 'string' ) return;
  if( envelope.msg.toUpperCase() !== 'SHUTDOWN' ) return;

  process.exit();
});

citizen.mail.receive();

// wait ten secs before shutting down
  setTimeout( process.exit, 10000 );