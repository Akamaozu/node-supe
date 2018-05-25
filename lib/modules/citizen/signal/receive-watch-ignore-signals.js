var signal_hooks = require('cjs-sync-hooks')();

module.exports = function( supe, config ){

  supe.signal.watch = watch_signal;
  supe.signal.ignore = ignore_signal;

  // receive signals
    process.on( 'message', function( msg ){
      if( ! msg.type || msg.type !== 'signal' ) return;

      var signal_name = msg.signal,
          signal_data = msg.data;

      console.log('running hooks for signal: ' + signal_name );
      signal_hooks.run( signal_name, signal_data );
    });

  function watch_signal( signal_name, watcher_name, callback ){
    if( ! signal_name || typeof signal_name !== 'string' ) throw new Error( 'signal name must be a string' );
    if( ! watcher_name || typeof watcher_name !== 'string' ) throw new Error( 'watcher name must be a string' );
    if( ! callback || typeof callback !== 'function' ) throw new Error( 'watcher callback must be a function' );

    return signal_hooks.add( signal_name, watcher_name, callback );
  }

  function ignore_signal( signal_name, watcher_name ){
    if( ! signal_name || typeof signal_name !== 'string' ) throw new Error( 'signal name must be a string' );
    if( ! watcher_name || typeof watcher_name !== 'string' ) throw new Error( 'watcher name must be a string' );

    return signal_hooks.del( signal_name, watcher_name );
  }
}