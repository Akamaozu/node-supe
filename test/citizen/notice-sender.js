var supe = require('../../index');

supe.noticeboard.notify( 'sample-notice-from-citizen', 'hello supervisor' );

setTimeout( process.exit, 10000 );