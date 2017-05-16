var merge = require('merge-objects');

module.exports = function( supervisor, config ){

  config = merge({ retries: 3, duration: 3 }, config || {} );

  var citizens = {};

  require( '../../../../utils/load-directory-of-modules' )( __dirname, {

    load_args: [ supervisor, citizens, config ],
    file: function( name ){

      if( name === 'index.js' ) return false;
      return true;
    }
  });
}