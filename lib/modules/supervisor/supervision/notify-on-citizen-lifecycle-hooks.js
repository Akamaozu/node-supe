module.exports = function( supervisor ){

  supervisor.hook.add( 'citizen-started', 'notify-on-start', function( details ){
    supervisor.noticeboard.notify( 'citizen-started', { name: details.name });
    supervisor.noticeboard.notify( details.name + '-started' );
  });

  supervisor.hook.add( 'citizen-shutdown', 'notify-on-shutdown', function( details ){
    supervisor.noticeboard.notify( 'citizen-shutdown', { name: details.name });
    supervisor.noticeboard.notify( details.name + '-shutdown' );
  });

  supervisor.hook.add( 'citizen-crashed', 'notify-on-crash', function( details ){
    supervisor.noticeboard.notify( 'citizen-crashed', { name: details.name });
    supervisor.noticeboard.notify( details.name + '-crashed' );
  });

  supervisor.hook.add( 'citizen-excessive-crash', 'notify-on-excessive-crash', function( details ){
    supervisor.noticeboard.notify( 'citizen-excessive-crash', { name: details.name });
    supervisor.noticeboard.notify( details.name + '-excessive-crash' );
  });
}