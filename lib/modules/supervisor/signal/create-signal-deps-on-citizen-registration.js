module.exports = function( supervisor, config ){

  supervisor.hook.add( 'citizen-registration', 'setup-signal-module', function( citizen ){

    citizen.signal = {};
    citizen.signal.send = send_signal;

    function send_signal( signal_name, data ){
      if( !signal_name || typeof signal_name !== 'string' ) return;

      var signal = { type: 'signal', signal: signal_name };
      if( data ) signal.data = data;

      try {
        citizen.ref.send( signal );
      }

      catch(e){
        console.log({ action: 'send-signal-to-citizen', to: citizen.name, success: false, error: e.message, details: { signal: signal_name, data: data } });
      }
    }
  });
}