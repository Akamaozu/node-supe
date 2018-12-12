module.exports = function( supervisor ){

  supervisor.hook.add( 'citizen-starting', 'create-stdout-and-stderr-hooks', function( citizen ){

    citizen.ref.stdout.on( 'data', function( data ){
      var output = data.toString();

      supervisor.hook.run( 'citizen-stdout', { name: citizen.name, data: output });
      supervisor.hook.run( citizen.name + '-stdout', { data: output });
    });

    citizen.ref.stderr.on( 'data', function( data ){
      var error = data.toString();

      supervisor.hook.run( 'citizen-stderr', { name: citizen.name, data: error });
      supervisor.hook.run( citizen.name + '-stderr', { data: error });
    });
  });
}