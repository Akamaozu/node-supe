module.exports = function( supervisor, citizen ){
  if( ! citizen.state.current_mail ) return;

  citizen.mail.inbox.splice( 0, 0, citizen.state.current_mail );
  citizen.state.current_mail = null;
}