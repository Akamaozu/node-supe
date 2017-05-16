module.exports = function( supervisor, config ){

  supervisor.middleware.add( 'citizen-starting', function( citizen ){

    citizen.ref.on( 'message', function( envelope ){

      if( Object.prototype.toString.call( envelope ) !== '[object Object]' ) return;
      if( !envelope.hasOwnProperty( 'type' ) ) return;
      if( envelope.type !== 'signal' ) return;

      envelope.from = citizen.name;

      supervisor.noticeboard.notify( 'citizen-signal', envelope );
    });
  });
}