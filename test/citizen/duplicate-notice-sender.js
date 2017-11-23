var supe = require('../../index');

var iterations = 10;

while( iterations > 0 ) {
  setTimeout( function( count ){

    supe.noticeboard.once( 'sample-notice', 'send-mail-' + ( 11 - count ), function( msg ){  
      supe.mail.send({ notice: 'sample-notice', received: msg.notice });
    }, { useCache: true });
  }, 1 * iterations, iterations );  

  iterations -= 1;
}

setTimeout( process.exit, 10000 );