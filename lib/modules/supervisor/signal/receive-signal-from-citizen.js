module.exports = function( supervisor, config ){

  supervisor.hook.add( 'citizen-starting', 'notify-when-signal-is-received', function( citizen ){

    citizen.ref.on( 'message', function( envelope ){
      if( Object.prototype.toString.call( envelope ) !== '[object Object]' ) return;
      if( !envelope.hasOwnProperty( 'type' ) ) return;
      if( envelope.type !== 'signal' ) return;

      envelope.from = citizen.name;

      supervisor.hook.run( 'citizen-signal', envelope );
    });
  });
}