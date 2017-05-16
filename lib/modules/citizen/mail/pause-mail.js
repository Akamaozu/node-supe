module.exports = function( citizen, config ){
  
  if( !citizen.hasOwnProperty( 'mail' ) ) citizen.mail = {};

  citizen.mail.pause = function pause_mail(){

    citizen.signal( 'NOT-READY-TO-RECEIVE-MAIL' );
  }
}