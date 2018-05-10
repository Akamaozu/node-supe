var shutdown_initiated = false,
    delays = 0;

module.exports = function( citizen, config ){
  
  citizen.signal.watch( 'SUPE-SHUTDOWN', 'supe-initiate-shutdown', function(){
    if( shutdown_initiated ) return;
    else shutdown_initiated = true;

    citizen.hook.run( 'shutdown', delay_shutdown );
    if( ! delays ) return process.exit();
  });

  function delay_shutdown(){
    delays += 1;
    return clear_delay;
  }

  function clear_delay(){
    delays -= 1;

    if( !delays ) process.exit();
  }
}