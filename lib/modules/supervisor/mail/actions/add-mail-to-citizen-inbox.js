var merge = require('merge-objects');

module.exports = function( supervisor, citizen, envelope ){
  if( ! envelope ) throw new Error( 'no message given to send to citizen' );

  citizen.mail.inbox.push( envelope );

  supervisor.hook.run( 'citizen-mail-added-to-inbox', { citizen: citizen.name });
  supervisor.hook.run( citizen.name + '-mail-added-to-inbox' );
}