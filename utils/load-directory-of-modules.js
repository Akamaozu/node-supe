var fs = require('fs'),
    path_util = require('path');

module.exports = function( path, config ){
  
  if( !path ) return;
  if( !config ) config = {};
  if( typeof path !== 'string' ) throw new Error( 'directory path must be a string' );
  if( !fs.lstatSync( path ).isDirectory() ) throw new Error( 'path must be to a directory' );

  if( !config.dir_entry_file || typeof config.dir_entry_file !== 'string' ) config.dir_entry_file = 'index.js';
  if( !config.load_args || Object.prototype.toString.call( config.load_args ) !== '[object Array]' ) config.load_args = [];

  var path_content = fs.readdirSync( path );

  path_content.forEach( function( item ){

    var item_path = path_util.join( path, item ),
        item_stat = fs.lstatSync( item_path ),
        item_type;

    if( item_stat.isFile() ) item_type = 'file';
    else if( item_stat.isDirectory() ) item_type = 'dir';
    else item_type = 'unsupported';

    if( item_type == 'unsupported' ) return;

    // bail if conditions for loading item type are false-y
      if( 
        config.hasOwnProperty( item_type )
        && ( 
          !config[ item_type ] 
          || ( typeof config[ item_type ] == 'function' && !config[ item_type ]( item ) ) 
        ) 
      ) return;

    switch( item_type ){

      case 'file':

        try{
          require( item_path ).apply( null, config.load_args );
        }

        catch( e ){ throw e }
      break;

      case 'dir':

        try{
          require( path_util.join( item_path, config.dir_entry_file ) ).apply( null, config.load_args );
        }

        catch( e ){ throw e }
      break;
    }
  });
}