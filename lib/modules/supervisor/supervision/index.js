var require_dir = require( 'require-directory' ),
    merge = require('merge-objects');

module.exports = function( supervisor, config ){
  var citizens = {},
      default_supervision_config = { retries: 3, duration: 3 };

  if( !config ) config = {};
  config = merge( default_supervision_config, config );

  require_dir( module, { visit: run_found_module, recurse: false });

  function run_found_module( found ){
    found( supervisor, citizens, config );
  }
}