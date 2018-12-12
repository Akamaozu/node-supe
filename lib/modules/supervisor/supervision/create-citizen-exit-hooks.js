module.exports = function( supervisor ){

  supervisor.hook.add( 'citizen-starting', 'create-citizen-exit-hooks', function( citizen ){

    citizen.ref.on( 'close', function( exit_code ){

      delete citizen.ref;

      if( exit_code === 0 || exit_code == null ){
        supervisor.hook.run( 'citizen-shutdown', { name: citizen.name });
        supervisor.hook.run( citizen.name + '-shutdown' );
      }

      else {
        supervisor.hook.run( 'citizen-crashed', { name: citizen.name });
        supervisor.hook.run( citizen.name + '-crashed' );
      }
    });
  });
}