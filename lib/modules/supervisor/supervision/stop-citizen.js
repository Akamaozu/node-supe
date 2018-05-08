module.exports = function( supervisor, citizens, config ){

  supervisor.stop = stop_citizen;

  function stop_citizen( name ){
    // if unregistered, reject
      if( ! supervisor.is_registered( name ) ) throw new Error( 'no citizen named "' + name + '" has been registed' );

    var citizen = citizens[ name ];

    // bail if citizen is not running
      if( ! citizen.ref ) return;

    citizen = supervisor.hook.run( 'citizen-stopping', citizen );

    citizen.ref.kill('SIGHUP');

    delete citizen.ref;

    citizens[ name ] = citizen;

    return citizens[ name ];
  }
}
