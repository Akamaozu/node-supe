module.exports = function( citizen, config ){

  citizen.mail.receive = function receive_mail(){
    citizen.signal.send( 'READY-TO-RECEIVE-MAIL' );
  }
}