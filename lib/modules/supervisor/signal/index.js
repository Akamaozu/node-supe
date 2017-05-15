module.exports = function( supervisor, config ){

  require( '../../../../utils/load-directory-of-modules' )( __dirname, {

    load_args: [ supervisor, config ],
    file: function( name ){

      if( name === 'index.js' ) return false;
      return true;
    }
  });
}