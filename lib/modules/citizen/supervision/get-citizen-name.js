module.exports = function( citizen ){
  citizen.get_name = get_name;

  function get_name(){
    return process.env.SUPE_CITIZEN_NAME;
  }
}