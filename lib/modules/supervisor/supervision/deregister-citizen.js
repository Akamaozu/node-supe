module.exports = function( supervisor, citizens, config ){

  supervisor.deregister = deregister_citizen;

  function perform_deregister_citizen( accept, reject, name ) {
    supervisor.hook.run( 'citizen-deregistration', citizens[ name ] );

    delete citizens[ name ];

    // deregistration complete
      supervisor.noticeboard.notify( 'citizen-deregistered', { name: name });
      supervisor.noticeboard.notify( name + '-deregistered' );

    return accept();
  }

  function deregister_citizen( name ){
    return new Promise( function ( accept, reject ) {
      // if unregistered, reject
        if( ! supervisor.is_registered( name ) )
          return reject( new Error( 'no citizen named "' + name + '" has been registed' ) );

      // if citizen is not running then complete
        if( citizens[ name ].ref )
          return supervisor.stop( name )
            .then( () => perform_deregister_citizen( accept, reject, name ) )
            .catch( reject );

      return perform_deregister_citizen( accept, reject, name );
    }) ;
  }
}
