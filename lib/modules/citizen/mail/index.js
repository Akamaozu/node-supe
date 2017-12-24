var require_dir = require( 'require-directory' );

module.exports = function( citizen, config ){

  citizen.mail = {};

  require_dir( module, { visit: run_found_module, recursive: false });

  function run_found_module( found ){
    found( citizen, config );
  }
}