var require_dir = require( 'require-directory' );

module.exports = function( supervisor, config ){

  require_dir( module, { visit: run_found_module, recursive: false });

  function run_found_module( found ){
    found( supervisor, config );
  }
}