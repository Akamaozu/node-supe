module.exports = require('./lib/supervisor');

if( process && process.send ){

  // is exporting to a citizen
  // overload export with citizen-related utils
    module.exports.supervised = true;
    module.exports.use = load_citizen_module;

  // load citizen core modules
    module.exports.use( require('./lib/modules/citizen/signal') );
    module.exports.use( require('./lib/modules/citizen/mail') );
    module.exports.use( require('./lib/modules/citizen/supervisor-noticeboard-bindings') );
}

function load_citizen_module( loader ){

  if( !loader ) return false;
  if( typeof loader != 'function' ) throw new Error( 'module loader must be a function' );

  loader( module.exports );
}