module.exports = function( supervisor, citizen ){
  if( citizen.state.pause_mail == false ) throw new Error( 'citizen mail already unpaused' );

  citizen.state.pause_mail = false;

  supervisor.hook.run( 'citizen-mail-unpaused', { citizen: citizen.name });
  supervisor.hook.run( citizen.name + '-mail-unpaused' );
}