module.exports = function( supervisor, config ){

  supervisor.noticeboard.watch( 'citizen-crashed', 'handle-restart', function( msg ){

    var name = msg.notice.name,
        citizen = supervisor.get( name );

    if( !citizen.retries ) citizen.retries = 0;

    if( citizen.retries >= citizen.config.retries ){

      supervisor.noticeboard.notify( 'citizen-excessive-crash', { name: name, retries: citizen.retries, max_retries: citizen.config.retries, duration: citizen.config.duration });
      supervisor.noticeboard.notify( name + '-excessive-crash', { retries: citizen.retries, max_retries: citizen.config.retries, duration: citizen.config.duration });

      return;
    }

    supervisor.start( name );

    citizen.retries += 1;

      supervisor.noticeboard.notify( 'citizen-auto-restarted', { name: name, retries: citizen.retries, max_retries: citizen.config.retries, duration: citizen.config.duration });
      supervisor.noticeboard.notify( name + '-auto-restarted', { retries: citizen.retries, max_retries: citizen.config.retries, duration: citizen.config.duration });

    setTimeout( function(){

      citizen.retries -= 1;
    }, citizen.config.duration * 1000 * 60 );
  });
}