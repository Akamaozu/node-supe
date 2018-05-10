module.exports = function( supervisor, citizens, config ){

  supervisor.deregister = deregister_citizen;

  function deregister_citizen( name ){
    // if unregistered, throw error
      if( ! supervisor.is_registered( name ) ) throw new Error( 'no citizen named "' + name + '" has been registed' );

    var citizen_is_running = citizens[ name ].ref ? true : false;

    // deregister if citizen is not running
      if( ! citizen_is_running ) return perform_deregister( name );
      if( citizens[ name ].state.deregistering ) return;

    // else stop then deregister
      citizens[ name ].state.deregistering = true;

      supervisor.noticeboard.once( name + '-stopped', 'complete-'+ name +'-deregistration', function(){
        perform_deregister( name );
      });

      supervisor.stop( name );

    function perform_deregister( name ) {
      supervisor.hook.run( name + '-deregistering', citizens[ name ] );
      supervisor.hook.run( 'citizen-deregistering', citizens[ name ] );

      delete citizens[ name ];

      supervisor.noticeboard.notify( 'citizen-deregistered', { name: name });
      supervisor.noticeboard.notify( name + '-deregistered' );
    }
  }
}
