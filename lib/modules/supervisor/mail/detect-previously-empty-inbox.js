module.exports = function( supervisor ){

  supervisor.hook.add( 'mail-added-to-inbox', 'detect-previously-empty-inbox', function( details ){
    var citizen_name = details.citizen,
        citizen = supervisor.get( citizen_name );

    if( citizen.mail.inbox.length === 1 ) supervisor.hook.run( citizen_name + '-inbox-no-longer-empty' );
  });
}