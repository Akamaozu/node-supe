module.exports = function( citizen ){

  citizen.hook.add( 'unhandled-citizen-mail', 'unhandled-citizen-mail-signal', function( envelope ){
    citizen.signal.send( 'UNHANDLED-MAIL', envelope );
  });
}