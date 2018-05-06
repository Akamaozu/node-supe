module.exports = function( supervisor, citizens, config ){

  supervisor.stop = stop_citizen;

  function stop_citizen( name ){
    return new Promise( function ( accept, reject ) {
      // if unregistered, reject
        if( ! supervisor.is_registered( name ) )
          return reject( new Error( 'no citizen named "' + name + '" has been registed' ) );

      var citizen = citizens[ name ];

      // if citizen is not running then complete
        if( ! citizen.ref ) return accept();

      citizen = supervisor.hook.run( 'citizen-stoping', citizen );

      citizen.ref.kill('SIGHUP');

      delete citizen.ref;

      return accept();
    } );
  }
}
