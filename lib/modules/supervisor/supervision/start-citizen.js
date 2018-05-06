var child_process = require('child_process');

module.exports = function( supervisor, citizens, config ){

  supervisor.start = start_citizen;

  function perform_start_citizen ( accept, reject, name, file, params ) {
    // specified filepath doesn't match registered citizen's filepath? something is wrong
      if( file && file !== citizens[ name ].file )
        return reject( new Error( 'citizen named "' + name + '" already exists' ) );

    var citizen = citizens[ name ];

    // bail if citizen is already running
      if( citizen.ref ) return reject( new Error( 'citizen named "' + name + '" already exists and is running' ) );

    // spawn citizen process
      citizen.ref = child_process.spawn( 'node', [ citizens[ name ].file ], {
        stdio: [ 'pipe', 'pipe', 'pipe', 'ipc' ],
        env: {
          SUPE_CITIZEN_NAME: name
        }
      });

    citizen = supervisor.hook.run( 'citizen-starting', citizen );

    supervisor.noticeboard.notify( name + '-started' );
    supervisor.noticeboard.notify( 'citizen-started', { name: name });

    return accept(citizen);
  }

  function start_citizen( name, file, params ){
    return new Promise( function ( accept, reject ) {
      // if unregistered, register citizen now
        if( ! supervisor.is_registered( name ) )
          return supervisor.register( name, file, params )
          .then( () => perform_start_citizen( accept, reject, name, file, params ) )
          .catch( reject );

      return perform_start_citizen( accept, reject, name, file, params );
    } );
  }
}
