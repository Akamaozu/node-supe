module.exports = function( citizen, config ){

  citizen.hook.add( 'supervisor-ipc', 'detect-signal', function( details ){
    if( ! details || ! details.hasOwnProperty( 'data' ) ) return;

    var envelope = details.data;

    if( Object.prototype.toString.call( envelope ) !== '[object Object]' ) return;
    if( ! envelope.hasOwnProperty( 'type' ) ) return;
    if( envelope.type !== 'signal' ) return;

    citizen.hook.run( 'supervisor-signal', envelope );
    citizen.hook.end();
  });
}