module.exports = function( supervisor ){

  supervisor.hook.add( 'citizen-registered', 'log-to-stdio', function( details ){
    var name = details.name;
    console.log( name + ' registered' );
  });

  supervisor.hook.add( 'citizen-deregistered', 'log-to-stdio', function( details ){
    var name = details.name;
    console.log( name + ' deregistered' );
  });

  supervisor.hook.add( 'citizen-started', 'log-to-stdio', function( details ){
    var name = details.name;
    console.log( name + ' started' );
  });

  supervisor.hook.add( 'citizen-auto-restarted', 'log-to-stdio', function( details ){
    var name = details.name;
    console.log( name + ' auto-restarted by supe' );
  });

  supervisor.hook.add( 'citizen-stopped', 'log-to-stdio', function( details ){
    var name = details.name;
    console.log( name + ' stopped' );
  });

  supervisor.hook.add( 'citizen-shutdown', 'log-to-stdio', function( details ){
    var name = details.name;
    console.log( name + ' shutdown' );
  });

  supervisor.hook.add( 'citizen-crashed', 'log-to-stdio', function( details ){
    var name = details.name;
    console.log( name + ' crashed' );
  });

  supervisor.hook.add( 'citizen-excessive-crash', 'log-to-stdio', function( details ){
    var name = details.name;
    console.log( name + ' crashed excessively' );
  });
}