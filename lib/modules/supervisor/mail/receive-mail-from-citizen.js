module.exports = function( supervisor, config ){

  supervisor.hook.add( 'citizen-ipc', 'detect-citizen-mail', function( details ){
    if( ! details || ! details.hasOwnProperty( 'data' ) ) return;

    var envelope = details.data;

    if( Object.prototype.toString.call( envelope ) !== '[object Object]' ) return;
    if( ! envelope.hasOwnProperty( 'type' ) ) return;
    if( envelope.type !== 'mail' ) return;

    envelope.from = details.name;

    supervisor.hook.run( 'received-mail-from-citizen', envelope );
    supervisor.hook.end();
  });
}