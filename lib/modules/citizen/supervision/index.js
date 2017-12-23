module.exports = function( citizen, config ){

  require( '../../../../utils/load-directory-of-modules' )( __dirname, {
    load_args: [ citizen, config ],
    file: function( name ){
      if( name === 'index.js' ) return false;
      return true;
    }
  });
}