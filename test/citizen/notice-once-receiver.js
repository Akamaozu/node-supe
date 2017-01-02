var supe = require('../../index');

supe.noticeboard.once( 'sample-notice', 'send-reply-mail', function( msg ){
  
  supe.mail.send({ notice: 'sample-notice', received: msg.notice });
});

setTimeout( process.exit, 10000 );