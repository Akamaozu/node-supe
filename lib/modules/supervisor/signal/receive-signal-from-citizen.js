module.exports = function( supervisor, config ){

  supervisor.hook.add( 'citizen-ipc', 'detect-signal', function( details ){
    if( ! details || ! details.hasOwnProperty( 'data' ) ) return;

    var envelope = details.data;

    if( Object.prototype.toString.call( envelope ) !== '[object Object]' ) return;
    if( !envelope.hasOwnProperty( 'type' ) ) return;
    if( envelope.type !== 'signal' ) return;

    envelope.from = details.name;

    supervisor.hook.run( 'citizen-signal', envelope );
    supervisor.hook.end();
  });
}