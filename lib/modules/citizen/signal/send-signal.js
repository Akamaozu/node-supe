module.exports = function( citizen, config ){

  citizen.signal.send = function send_signal( signal, data ){
    if( ! signal ) return;
    if( typeof signal !== 'string' ) throw new Error( 'signal must be a string' );

    var envelope = { type: 'signal', signal: signal };
    if( data ) envelope.data = data;

    process.send( envelope );
  }
}