module.exports = send_signal;

function send_signal( signal ){

  process.send({ msg: { type: 'signal', signal: signal }});
}