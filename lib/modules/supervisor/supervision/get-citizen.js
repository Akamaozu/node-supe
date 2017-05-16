module.exports = function( supervisor, citizens ){
  
  supervisor.get = get_citizen;

  function get_citizen( name ){

    if( !name || !citizens[ name ] ) return false;

    return citizens[ name ];
  }
}