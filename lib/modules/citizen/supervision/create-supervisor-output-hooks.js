module.exports = function( citizen ){

  process.on( 'message', function( msg ){
    citizen.hook.run( 'supervisor-ipc', { data: msg });
  });
}