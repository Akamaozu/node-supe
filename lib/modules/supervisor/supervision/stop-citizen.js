module.exports = function( supervisor, citizens, config ){

  supervisor.stop = stop_citizen;

  function stop_citizen( name ){
    if( ! name ) throw new Error( 'no citizen name given' );
    if( typeof name !== 'string' ) throw new Error( 'citizen name given must be a string' );

    // if unregistered, reject
      if( ! supervisor.is_registered( name ) ) throw new Error( 'no citizen named "' + name + '" has been registed' );

    var citizen = citizens[ name ],
        stop_confirmed = false,
        stop_request_timeout;

    // bail if citizen is stopping or not running
      if( citizen.state.stopping ) return;
      if( ! citizen.ref ) return;

    citizen.state.stopping = true;

    citizen = supervisor.hook.run( name + '-stopping', citizen );
    citizen = supervisor.hook.run( 'citizen-stopping', citizen );

    // Graceful Shutdown Strategy

    // 1. Send signal to citizen
    //    to clean up and shut
    //    themselves down.

    supervisor.noticeboard.once( name + '-shutdown', 'supe-confirm-citizen-stop', confirm_citizen_stop );
    supervisor.noticeboard.once( name + '-crashed', 'supe-confirm-citizen-stop', confirm_citizen_stop );

    citizen.signal.send( 'SUPE-SHUTDOWN' );

    // 2. If citizen doesnt shut
    //    down in grace time,
    //    kill it.

    var grace_time_ms = 1000 * 8;

    setTimeout( function(){
      if( stop_confirmed || ! citizen.state.stopping ) return;
      citizen.ref.kill();
    }, grace_time_ms );

    return citizens[ name ];

    function confirm_citizen_stop(){
      if( stop_confirmed ) return;

      citizen.state.stopping = false;
      supervisor.noticeboard.notify( 'citizen-stopped', { name: name });
      supervisor.noticeboard.notify( name + '-stopped' );

      stop_confirmed = true;
    }
  }
}
