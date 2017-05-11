module.exports = function( supervisor, config ){

  supervisor.middleware.add( 'citizen-starting', function( citizen ){

    citizen.ref.on( 'close', function( code ){

      delete citizen.ref;

      if( code === 0 ){
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
        supervisor.noticeboard.notify( 'citizen-shutdown', { name: citizen.name });
        supervisor.noticeboard.notify( citizen.name + '-shutdown' );
      }

      else{

        supervisor.noticeboard.notify( 'citizen-crashed', { name: citizen.name });
        supervisor.noticeboard.notify( citizen.name + '-crashed' );
      } 
    });
  });
}