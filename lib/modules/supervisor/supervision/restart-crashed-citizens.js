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

        setTimeout( function(){
          citizen.retries -= 1;
        }, citizen.config.duration * 1000 * 60 );
      });
    }
  });
}