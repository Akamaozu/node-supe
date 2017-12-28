var hooks = require('cjs-sync-hooks');

module.exports = function( supervisor, config ){
  
  supervisor.hook = hooks();
}