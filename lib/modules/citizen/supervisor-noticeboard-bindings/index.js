module.exports = function( citizen, config ){

  var Noticeboard = require('cjs-noticeboard'),
      noticeboard = new Noticeboard({ logOps: false, logging: false });

  citizen.noticeboard = {};
  citizen.noticeboard.pending = {};

  require( '../../../../utils/load-directory-of-modules' )( __dirname, {

    load_args: [ citizen, noticeboard, config ],
    file: function( name ){

      if( name === 'index.js' ) return false;
      return true;
    }
  });
}