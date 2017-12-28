module.exports = function( supervisor ){

  supervisor.hook.add( 'citizen-starting', 'notify-on-stdout', function( citizen ){

    citizen.ref.stdout.on( 'data', function( data ){
      var output = data.toString();

      supervisor.noticeboard.notify( 'citizen-output', { name: citizen.name, output: output });
      supervisor.noticeboard.notify( citizen.name + '-output', { output: output });
    });
  });
  
  supervisor.hook.add( 'citizen-starting', 'notify-on-stderr', function( citizen ){

    citizen.ref.stderr.on( 'data', function( data ){
      var error = data.toString();

      supervisor.noticeboard.notify( 'citizen-error', { name: citizen.name, error: error });
      supervisor.noticeboard.notify( citizen.name + '-error', { error: error });
    });
  });
}
