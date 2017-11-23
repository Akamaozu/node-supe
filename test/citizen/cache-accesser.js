var supe = require('../../index');

supe.noticeboard.watch( 'sample-notice', 'send-reply-mail', reply_via_mail, { useCache: true });

function reply_via_mail( msg ){
  supe.mail.send({ notice: 'sample-notice', received: msg.notice });
}

setTimeout( process.exit, 10000 );