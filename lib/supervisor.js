module.exports = supe;

function supe( config ){
  
  var supervisor = {},
      config = config || {};

  supervisor.use = load_module;

  // load core modules
    supervisor.use( require( './modules/supervisor/hook' ) );
    supervisor.use( require( './modules/supervisor/noticeboard' ) );
    supervisor.use( require( './modules/supervisor/supervision' ) );
    supervisor.use( require( './modules/supervisor/signal' ) );
    supervisor.use( require( './modules/supervisor/mail' ) );

  return supervisor;

  function load_module( loader ){

    if( !loader ) return false;
    if( typeof loader != 'function' ) throw new Error( 'module loader must be a function' );

    loader( supervisor, config );
  }
}