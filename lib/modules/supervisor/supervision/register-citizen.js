var merge = require('merge-objects');

module.exports = function( supervisor, citizens, config ){
  
  supervisor.register = register_citizen;

  function register_citizen( name, file, params ){

    // filter bad input
      if( !name ) throw new Error( 'requires a name to refer to supervised process' );
      if( !file ) throw new Error( 'requires path to file to run to supervised process' );
      if( typeof name !== 'string' ) throw new Error( 'name must be a string' );
      if( typeof file !== 'string' ) throw new Error( 'path to file must be a string' );
      if( !params ) params = {};

    // ensure citizen name isn't already taken 
      if( supervisor.is_registered( name ) ){

        if( citizens[ name ].file === file ) return citizens[ name ];
        else throw new Error( 'a citizen named "' + name + '" already exists' ); 
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

    return citizens[ name ];
  }
}