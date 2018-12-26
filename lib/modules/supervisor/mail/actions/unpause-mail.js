module.exports = function( supervisor, citizen ){
  if( ! citizen.state.hasOwnProperty( 'pause_mail' ) || citizen.state.pause_mail == false ) return;

  citizen.state.pause_mail = false;

  supervisor.hook.run( 'citizen-mail-unpaused', { citizen: citizen.name });
  supervisor.hook.run( citizen.name + '-mail-unpaused' );
}