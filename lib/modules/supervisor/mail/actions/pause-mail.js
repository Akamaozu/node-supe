module.exports = function( supervisor, citizen ){
  if( citizen.state.pause_mail === true ) throw new Error( 'mail already paused' );

  citizen.state.pause_mail = true;

  supervisor.hook.run( 'citizen-mail-paused', { citizen: citizen.name });
  supervisor.hook.run( citizen.name + '-mail-paused' );
}