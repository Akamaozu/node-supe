module.exports = function( supervisor, citizen ){
  if( citizen.mail.inbox.length < 1 ){
    supervisor.hook.run( 'citizen-inbox-empty', { citizen: citizen.name });
    supervisor.hook.run( citizen.name + '-inbox-empty' );
  }

  else {
    citizen.state.current_mail = citizen.mail.inbox.splice( 0, 1 )[0];
    citizen.ref.send( citizen.state.current_mail );

    supervisor.hook.run( 'citizen-new-current-mail', { citizen: citizen.name });
    supervisor.hook.run( citizen.name + '-new-current-mail' );
  }
}