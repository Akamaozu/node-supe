var citizen = require('../../index');

citizen.hook.add( 'citizen-mail', 'reply-all-mail', function( envelope, ack ){
  console.log( envelope );
  citizen.mail.send( 'hello supervisor' );

  ack();
});

citizen.mail.receive();