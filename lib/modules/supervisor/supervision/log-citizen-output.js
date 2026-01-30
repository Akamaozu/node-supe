module.exports = function( supervisor ){

  supervisor.hook.add( 'citizen-stdout', 'pipe-to-stdout', function( details ){
    var name = details.name,
        prefix = '[' + name + ']',
        output_lines = details.data.trim().split('\n');

    output_lines.forEach( function( line ){
      var line_has_tag_prefix = (
        line[0] == '['
        && line.indexOf('] ') > -1
      );

      console.log( prefix + (line_has_tag_prefix ? '' : ' ') + line );
    });
  });

  supervisor.hook.add( 'citizen-stderr', 'pipe-to-stderr', function( details ){
    var name = details.name,
        prefix = '[' + name + ']',
        error_lines = details.data.trim().split('\n');

    error_lines.forEach( function( line ){
      var line_has_tag_prefix = (
        line[0] == '['
        && line.indexOf('] ') > -1
      );

      console.error( prefix + (line_has_tag_prefix ? '' : ' ') + line );
    });
  });
}