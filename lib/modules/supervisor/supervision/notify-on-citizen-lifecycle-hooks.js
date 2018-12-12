module.exports = function( supervisor ){

  supervisor.hook.add( 'citizen-registered', 'notify-on-registration', function( details ){
    supervisor.noticeboard.notify( 'citizen-registered', { name: details.name });
    supervisor.noticeboard.notify( details.name + '-registered' );
  });

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
}