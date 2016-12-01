module.exports = send_signal;

function send_signal( signal ){

  process.send({ type: 'signal', signal: signal });
}