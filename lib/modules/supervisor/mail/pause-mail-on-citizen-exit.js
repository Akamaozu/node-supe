var pause_mail = require( './actions/pause-mail' );

module.exports = function( supervisor, config ){

  supervisor.hook.add( 'citizen-shutdown', 'pause-mail', pause_mail_on_citizen_process_exit );
  supervisor.hook.add( 'citizen-crashed', 'pause-mail', pause_mail_on_citizen_process_exit );

  function pause_mail_on_citizen_process_exit( details ){
    var name = details.name,
        citizen = supervisor.get( name );

    if( ! citizen.state.pause_mail ) pause_mail( supervisor, citizen );
  }
}