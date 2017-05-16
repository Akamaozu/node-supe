var child_process = require('child_process');

module.exports = function( supervisor, citizens, config ){

  supervisor.start = start_citizen;

  function start_citizen( name, file, params ){

    if( !supervisor.is_registered( name ) ){

      var registered = supervisor.register( name, file, params );

      if( !registered ) return registered;
    }

    else {

      // file speficied doesn't match existing citizens? something's wrong 
      if( file && file !== citizens[ name ].file ) throw new Error( 'citizen named "' + name + '" already exists' ); 
    }

    citizens[ name ].ref = child_process.spawn( 'node', [ citizens[ name ].file ], { stdio: [ 'pipe', 'pipe', 'pipe', 'ipc' ] });

    citizens[ name ] = supervisor.middleware.run( 'citizen-starting', citizens[ name ] );

    supervisor.noticeboard.notify( name + '-started' );
    supervisor.noticeboard.notify( 'citizen-started', { name: name });

    return citizens[ name ];
  }  
}