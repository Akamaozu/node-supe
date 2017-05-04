module.exports = function(){

  var map = {},
      api = {};

  api.add = add_middleware;
  api.run = run_stack;

  return api;

  function run_stack( name ){

    if( !name ) throw new Error( 'middleware stack name required' );
    
    var input = Array.prototype.splice.call( arguments, 1, arguments.length - 1 ),
        single_arg = true;

    switch( input.length ){

      case 1:
        input = input[0];
      break;

      case 0:
        input = undefined;
      break;

      default:
        single_arg = false;
      break;
    }

    if( !map.hasOwnProperty( name ) || Object.prototype.toString.call( map[ name ] ) !== '[object Array]' ) return input;

    map[ name ].forEach( function( middleware ){

      var result = single_arg ? middleware( input ) : middleware.apply( null, input );
      if( result ) input = result;
    });

    return input;
  }

  function add_middleware( name, middleware ){

    if( typeof name !== 'string' ) throw new Error( 'middleware name must be a string' );
    if( typeof middleware !== 'function' ) throw new Error( 'middleware must be a function' );

    if( !map.hasOwnProperty( name ) || Object.prototype.toString.call( map[ name ] ) !== '[object Array]' ) map[ name ] = [];

    map[ name ].push( middleware );
  }
}