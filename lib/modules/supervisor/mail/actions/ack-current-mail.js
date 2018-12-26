module.exports = function( supervisor, citizen ){
  if( ! citizen.state.hasOwnProperty( 'current_mail' ) || citizen.state.current_mail == null ) throw new Error( 'no current mail to acknowledge' );

  citizen.state.current_mail = null;

  supervisor.hook.run( 'citizen-current-mail-acked', { citizen: citizen.name });
  supervisor.hook.run( citizen.name + '-current-mail-acked' );
}