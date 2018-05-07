module.exports = function( supervisor ){

  supervisor.hook.add( 'citizen-starting', 'notify-on-exit', function( citizen ){

    citizen.ref.on( 'close', function( code ){

      delete citizen.ref;

      if( code === 0 ){
        supervisor.noticeboard.notify( 'citizen-shutdown', { name: citizen.name });
        supervisor.noticeboard.notify( citizen.name + '-shutdown' );
      }

      else if ( code !== null ){
        supervisor.noticeboard.notify( 'citizen-crashed', { name: citizen.name });
        supervisor.noticeboard.notify( citizen.name + '-crashed' );
      }
    });
  });
}
