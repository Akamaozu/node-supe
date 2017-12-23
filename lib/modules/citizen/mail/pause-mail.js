module.exports = function( citizen, config ){

  citizen.mail.pause = function pause_mail(){
    citizen.signal( 'NOT-READY-TO-RECEIVE-MAIL' );
  }
}