module.exports = function( supervisor, citizen ){
  if( ! citizen.state.current_mail ) throw new Error( 'no current mail to requeue' );

  citizen.mail.inbox.splice( 0, 0, citizen.state.current_mail );
  citizen.state.current_mail = null;

  supervisor.hook.run( 'citizen-current-mail-requeued', { citizen: citizen.name });
  supervisor.hook.run( citizen.name + '-current-mail-requeued' );
}