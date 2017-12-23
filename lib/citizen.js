module.exports = supe = require('./supervisor');

supe.supervised = true;
supe.use = load_citizen_module;

// load citizen core modules
  supe.use( require('./modules/citizen/signal') );
  supe.use( require('./modules/citizen/mail') );
  supe.use( require('./modules/citizen/supervisor-noticeboard-bindings') );
  supe.use( require('./modules/citizen/supervision') );

function load_citizen_module( loader ){

  if( !loader ) return false;
  if( typeof loader != 'function' ) throw new Error( 'module loader must be a function' );

  loader( supe );
}