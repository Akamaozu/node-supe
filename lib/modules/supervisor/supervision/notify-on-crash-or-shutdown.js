module.exports = function( supervisor ){

  supervisor.hook.add( 'citizen-shutdown', 'notify-on-shutdown', function( details ){
    supervisor.noticeboard.notify( 'citizen-shutdown', { name: details.name });
    supervisor.noticeboard.notify( details.name + '-shutdown' );
  });

  supervisor.hook.add( 'citizen-crashed', 'notify-on-crash', function( details ){
    supervisor.noticeboard.notify( 'citizen-crashed', { name: details.name });
    supervisor.noticeboard.notify( details.name + '-crashed' );
  });
}