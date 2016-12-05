var supe = require('../../index');

supe.mail.receive( function( envelope, ack ){

  console.log( envelope );
  supe.mail.send( 'hello supervisor' );
  ack();
});