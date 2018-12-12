module.exports = function( supervisor ){

  supervisor.hook.add( 'citizen-stdout', 'pipe-to-stdout', function( details ){
    var name = details.name,
        prefix = '[' + name + ']',
        output = details.data.trim();

    if( output[0] !== '[' ) prefix += ' ';

    console.log( prefix + output );
  });

  supervisor.hook.add( 'citizen-stderr', 'pipe-to-stderr', function( details ){
    var name = details.name,
        prefix = '[' + name + ']',
        error = details.data.trim();

    if( error[0] !== '[' ) prefix += ' ';

    console.error( prefix + error );
  });
}