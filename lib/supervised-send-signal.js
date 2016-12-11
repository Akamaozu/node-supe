module.exports = send_signal;

function send_signal( signal, data ){

  var envelope = { type: 'signal', signal: signal };

  if( data ) envelope.data = data;

  process.send( envelope );
}