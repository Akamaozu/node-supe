module.exports = require('./lib/supervisor');

if( process && process.send ){

  module.exports.supervised = true;

  module.exports.mail = require('./lib/supervised-mail');
  module.exports.signal = require('./lib/supervised-send-signal');
} 