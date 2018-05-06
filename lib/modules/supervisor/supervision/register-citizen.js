var merge = require('merge-objects');

module.exports = function( supervisor, citizens, config ){

  supervisor.register = register_citizen;

  function register_citizen( name, file, params ){
    return new Promise( function (accept, reject) {
      // filter bad input
        if( !name ) return reject( new Error( 'requires a name to refer to supervised process' ) );
        if( !file ) return reject( new Error( 'requires path to file to run to supervised process' ) );
        if( typeof name !== 'string' ) return reject( new Error( 'name must be a string' ) );
        if( typeof file !== 'string' ) return reject( new Error( 'path to file must be a string' ) );
        if( !params ) params = {};

      // ensure citizen name isn't already taken
        if( supervisor.is_registered( name ) ){

          if( citizens[ name ].file === file ) return accept( citizens[ name ] );
          else return reject( new Error( 'a citizen named "' + name + '" already exists' ) );
        }

      // store citizen in map
        citizens[ name ] = {

          name: name,
          file: file,
          state: {},

          config: merge({ retries: config.retries, duration: config.duration }, params )
        };

      // customize citizen instance
        citizens[ name ] = supervisor.hook.run( 'citizen-registration', citizens[ name ] );

      // registration complete
        supervisor.noticeboard.notify( 'citizen-registered', { name: name });
        supervisor.noticeboard.notify( name + '-registered' );

      return accept( citizens[ name ] );
    } );
  }
}
