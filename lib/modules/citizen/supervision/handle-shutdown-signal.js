var shutdown_initiated = false,
    shutdown_hook_running = false,
    delays = 0;

module.exports = function( citizen, config ){
  
  citizen.hook.add( 'supervisor-signal', 'handle-shutdown-request', function( envelope ){
    if( ! envelope || ! envelope.signal || envelope.signal !== 'SUPE-SHUTDOWN' ) return;
    if( shutdown_initiated ) return;

    shutdown_initiated = true;
    shutdown_hook_running = true;

    citizen.hook.run( 'shutdown', delay_shutdown );

    shutdown_hook_running = false;
    if( ! delays ) return process.exit();
  });

  function delay_shutdown(){
    delays += 1;
    return clear_delay;
  }

  function clear_delay(){
    delays -= 1;
    if( ! shutdown_hook_running && ! delays ) process.exit();
  }
}