module.exports = function( supervisor, citizens, config ){

  supervisor.is_registered = is_registered_citizen;

  function is_registered_citizen( name ){
    if( typeof name !== 'string' ) return false;
    else return citizens.hasOwnProperty( name );
  }
}