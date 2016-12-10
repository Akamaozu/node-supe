var supe = require('../../index');

supe.mail.receive( function( envelope, ack ){

  switch( envelope.msg ){

    case 'crash':
    case 'CRASH':

      throw new Error( 'chaos monkey strikes' );
    break;

    case 'shutdown':
    case 'SHUTDOWN':
    default:

      process.exit();
    break;
  } 
});

// wait ten secs before shutting down
  setTimeout( process.exit, 10000 );