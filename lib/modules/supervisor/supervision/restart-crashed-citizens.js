var _yield = require('cjs-yield');

module.exports = function( supervisor ){

  supervisor.hook.add( 'citizen-crashed', 'handle-restart', function( details ){
    var name = details.name,
        citizen = supervisor.get( name );

    if( ! citizen.retries ) citizen.retries = 0;

    if( citizen.retries >= citizen.config.retries ){
      supervisor.hook.run( 'citizen-excessive-crash', { name: name, retries: citizen.retries, max_retries: citizen.config.retries, duration: citizen.config.duration });
      supervisor.hook.run( name + '-excessive-crash', { retries: citizen.retries, max_retries: citizen.config.retries, duration: citizen.config.duration });
    }

    else {

      _yield( function(){
        supervisor.start( name );

        citizen.retries += 1;

        supervisor.hook.run( 'citizen-auto-restarted', { name: name, retries: citizen.retries, max_retries: citizen.config.retries, duration: citizen.config.duration });
        supervisor.hook.run( name + '-auto-restarted', { retries: citizen.retries, max_retries: citizen.config.retries, duration: citizen.config.duration });

        var action_name = 'clear-pending-retry-reduction-' + citizen.retries,
            action_cleanup = function() {
              citizen.retries -= 1;
              supervisor.hook.del( name + '-stopped', action_name );
            },
            action_cleanup_timer = setTimeout( action_cleanup, citizen.config.duration * 1000 * 60 );

        supervisor.hook.add( name + '-stopped', action_name, function( details ){
          clearTimeout( action_cleanup_timer );
          action_cleanup();
        });
      });
    }
  });
}