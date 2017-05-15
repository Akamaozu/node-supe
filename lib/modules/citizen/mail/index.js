var fs = require('fs'),
    path = require('path');

module.exports = function( citizen, config ){
  
  var dir_content = fs.readdirSync( __dirname );

  dir_content.forEach( function( item ){

    var item_path = path.join( __dirname, item );

    // is a file
      var is_file = fs.lstatSync( item_path ).isFile();

      if( is_file ){

        // .js extension
        // not index.js
          if( 
            item_path.indexOf( '.js' ) === item_path.length - 3 
            && item.toLowerCase() !== 'index.js'
          ){
            
            try {

              require( item_path )( citizen, config );
            }

            catch( e ){ throw e; }
          }
      }

    // is a directory
      var is_dir = fs.lstatSync( item_path ).isDirectory();

      if( is_dir ){

        // has index file to configure loading
          var index_path = path.join( item_path, 'index.js' );
          
          if( fs.existsSync( index_path ) ){
            
            try {

              require( index_path )( citizen, config );
            }

            catch( e ){ throw e; }
          }
      }
  });
}