var merge = require('merge-objects'),
    Noticeboard = require('cjs-noticeboard'),
    middleware = require('../utils/middleware');

module.exports = supe;

function supe( config ){
  
  var citizens = {},
      config = merge({ retries: 3, duration: 3 }, config || {} ),      
      noticeboard = new Noticeboard({ logging: false, logOps: false }),
      my_middleware = middleware(),
      public_interface = {};

  // create supervisor interface
    public_interface.noticeboard = noticeboard;
    public_interface.middleware = my_middleware;

    public_interface.register = register_citizen;
    public_interface.start = start_citizen;
    public_interface.get = get_citizen;
    public_interface.use = load_module;

  // load core modules
    public_interface.use( require( './modules/supervisor/pipe-citizen-output' ) );
    public_interface.use( require( './modules/supervisor/notify-on-crash-or-shutdown' ) );
    public_interface.use( require( './modules/supervisor/restart-crashed-citizens' ) );
    public_interface.use( require( './modules/supervisor/signal' ) );
    public_interface.use( require( './modules/supervisor/mail' ) );

  return public_interface;

  function start_citizen( name, file, params ){

    if( !is_registered_citizen( name ) ){

      var registered = register_citizen( name, file, params );

      if( !registered ) return registered;
    }

    else {

      if( file && file !== citizens[ name ].file ) throw new Error( 'citizen named "' + name + '" already exists' ); 
    }

    citizens[ name ].ref = require('child_process').spawn( 'node', [ citizens[ name ].file ], { stdio: [ 'pipe', 'pipe', 'pipe', 'ipc' ] });

    citizens[ name ] = my_middleware.run( 'citizen-starting', citizens[ name ] );

    noticeboard.notify( name + '-started' );
    noticeboard.notify( 'citizen-started', { name: name });

    return citizens[ name ];
  }

  function get_citizen( name ){

    if( !name || !citizens[ name ] ) return false;

    return citizens[ name ];
  }

  function register_citizen( name, file, params ){

    // filter bad input
      if( !name ) throw new Error( 'requires a name to refer to supervised process' );
      if( !file ) throw new Error( 'requires path to file to run to supervised process' );
      if( typeof name !== 'string' ) throw new Error( 'name must be a string' );
      if( typeof file !== 'string' ) throw new Error( 'path to file must be a string' );
      if( !params ) params = {};

    // ensure citizen name isn't already taken 
      if( is_registered_citizen( name ) ){

        if( citizens[ name ].file === file ) return citizens[ name ];
        else throw new Error( 'a citizen named "' + name + '" already exists' ); 
      }

    // base citizen instance
      citizens[ name ] = {};
      citizens[ name ].name = name;
      citizens[ name ].file = file;
      citizens[ name ].state = {};
      citizens[ name ].config = merge({ retries: config.retries, duration: config.duration }, params );;

    // customize citizen instance
      citizens[ name ] = my_middleware.run( 'citizen-registration', citizens[ name ] );

    // registration complete
      noticeboard.notify( 'citizen-registered', { name: name });
      noticeboard.notify( name + '-registered' );

    return citizens[ name ];
  }

  function is_registered_citizen( name ){

    if( typeof name !== 'string' ) return false;

    return citizens.hasOwnProperty( name );
  }

  function load_module( loader ){

    if( !loader ) return;
    if( typeof loader != 'function' ) throw new Error( 'module loader must be a function' );

    loader( public_interface, config );
  }
}