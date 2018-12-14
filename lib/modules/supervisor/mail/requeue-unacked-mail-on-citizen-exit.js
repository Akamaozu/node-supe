var requeue_current_mail = require( './actions/requeue-current-mail' );

module.exports = function( supervisor, config ){

  supervisor.hook.add( 'citizen-shutdown', 'requeue-unacked-mail', function( details ){
    var name = details.name,
        citizen = supervisor.get( name );

    requeue_current_mail( supervisor, citizen );
  });
  
  supervisor.hook.add( 'citizen-crashed', 'requeue-unacked-mail', function( details ){
    var name = details.name,
        citizen = supervisor.get( name );

    requeue_current_mail( supervisor, citizen );
  });
}