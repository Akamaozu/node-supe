module.exports = function( supervisor, config ){

  supervisor.noticeboard.watch( 'citizen-shutdown', 'requeue-unacked-mail', function( msg ){

    var name = msg.notice.name,
        citizen = supervisor.get( name );

    if( !citizen.state.current_mail ) return;

    citizen.mail.inbox.splice( 0, 0, citizen.state.current_mail );

    citizen.state.current_mail = null;
  });
  
  supervisor.noticeboard.watch( 'citizen-crashed', 'requeue-unacked-mail', function( msg ){

    var name = msg.notice.name,
        citizen = supervisor.get( name );

    if( !citizen.state.current_mail ) return;

    citizen.mail.inbox.splice( 0, 0, citizen.state.current_mail );

    citizen.state.current_mail = null;
  });
}