module.exports = function( supervisor, citizen, envelope ){
  citizen.mail.inbox.push( envelope );
  supervisor.hook.run( 'mail-added-to-inbox', { citizen: citizen.name });
}