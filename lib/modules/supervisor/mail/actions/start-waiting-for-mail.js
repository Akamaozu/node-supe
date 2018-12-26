module.exports = function( supervisor, citizen ){
  if( citizen.state.waiting_for_mail ) throw new Error( 'citizen already waiting for mail' );

  supervisor.hook.add( citizen.name + '-inbox-no-longer-empty', 'send-mail-to-ready-citizen', function(){
    supervisor.hook.del( citizen.name + '-inbox-no-longer-empty', 'send-mail-to-ready-citizen' );

    citizen.state.waiting_for_mail = false;
    if( citizen.state.pause_mail ) return;

    citizen.state.current_mail = citizen.mail.inbox.splice( 0, 1 )[0];
    citizen.ref.send( citizen.state.current_mail );
  });

  citizen.state.waiting_for_mail = true;

  supervisor.hook.run( 'citizen-waiting-for-mail', { citizen: citizen.name });
  supervisor.hook.run( citizen.name + '-waiting-for-mail' );
}