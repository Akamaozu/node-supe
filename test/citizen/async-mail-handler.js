var citizen = require('../../index');

citizen.hook.add( 'citizen-mail', 'handle-mail-asynchronously', function( envelope, handle_mail ){
  var ack = handle_mail();

  setTimeout( ack, 1000 );
});

citizen.mail.receive();

// wait ten secs before shutting down
  setTimeout( process.exit, 10000 );