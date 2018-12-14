module.exports = function( citizen ){
  
  citizen.hook.add( 'unhandled-citizen-mail', 'log-unhandled-mail', function( envelope ){
    console.log({ action: 'log-unhandled-mail', envelope: envelope });
  });
}