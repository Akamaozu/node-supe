var requeue_current_mail = require( './actions/requeue-current-mail' );

module.exports = function( supervisor, config ){

  supervisor.hook.add( 'citizen-shutdown', 'requeue-unacked-mail', requeue_unacked_mail_on_citizen_process_exit );
  supervisor.hook.add( 'citizen-crashed', 'requeue-unacked-mail', requeue_unacked_mail_on_citizen_process_exit );

  function requeue_unacked_mail_on_citizen_process_exit( details ){
    var name = details.name,
        citizen = supervisor.get( name );

    if( citizen.state.current_mail ) requeue_current_mail( supervisor, citizen );
  }
}