var requeue_current_mail = require( './actions/requeue-current-mail' );

module.exports = function( supervisor, config ){

  supervisor.noticeboard.watch( 'citizen-shutdown', 'requeue-unacked-mail', function( msg ){
    var name = msg.notice.name,
        citizen = supervisor.get( name );

    requeue_current_mail( supervisor, citizen );
  });
  
  supervisor.noticeboard.watch( 'citizen-crashed', 'requeue-unacked-mail', function( msg ){
    var name = msg.notice.name,
        citizen = supervisor.get( name );

    requeue_current_mail( supervisor, citizen );
  });
}