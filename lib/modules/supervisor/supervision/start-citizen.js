var child_process = require('child_process');

module.exports = function( supervisor, citizens, config ){

  supervisor.start = start_citizen;

  function start_citizen( name, file, params ){
    // specified filepath doesn't match registered citizen's filepath? something is wrong
      if( file && file !== citizens[ name ].file ) throw new Error( 'citizen named "' + name + '" already exists' );

    var citizen = citizens[ name ];

    // bail if citizen is already running
      if( citizen.ref ) return throw new Error( 'citizen named "' + name + '" already exists and is running' );

    // modify copy of current env for citizen
      var citizen_env = JSON.parse( JSON.stringify( process.env ) );
      citizen_env.SUPE_CITIZEN_NAME = name;
      citizen_env = supervisor.hook.run( 'citizen-starting-env', citizen_env, name );

    // spawn citizen process
      citizen.ref = child_process.spawn( 'node', [ citizens[ name ].file ], {
        stdio: [ 'pipe', 'pipe', 'pipe', 'ipc' ],
        env: citizen_env
      });

    citizen = supervisor.hook.run( 'citizen-starting', citizen );

    supervisor.noticeboard.notify( name + '-started' );
    supervisor.noticeboard.notify( 'citizen-started', { name: name });

    return citizen;
  }
}