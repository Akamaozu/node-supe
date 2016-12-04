var supe = require('../../index');

supe.mail.send( 'hello supervisor' );

supe.mail.receive( function( envelope, ack ){

  console.log( envelope );
  ack();
});