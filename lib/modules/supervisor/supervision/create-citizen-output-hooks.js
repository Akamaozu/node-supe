module.exports = function( supervisor ){

  supervisor.hook.add( 'citizen-starting', 'create-citizen-output-hooks', function( citizen ){

    // ipc
    citizen.ref.on( 'message', function( msg ){
      supervisor.hook.run( 'citizen-ipc', { name: citizen.name, data: msg });
      supervisor.hook.run( citizen.name + '-ipc', { data: msg });
    });

    // stdout
    citizen.ref.stdout.on( 'data', function( data ){
      var output = data.toString();

      supervisor.hook.run( 'citizen-stdout', { name: citizen.name, data: output });
      supervisor.hook.run( citizen.name + '-stdout', { data: output });
    });

    // stderr
    citizen.ref.stderr.on( 'data', function( data ){
      var error = data.toString();

      supervisor.hook.run( 'citizen-stderr', { name: citizen.name, data: error });
      supervisor.hook.run( citizen.name + '-stderr', { data: error });
    });
  });
}