module.exports = function( supervisor, config ){
  
  supervisor.hook.add( 'received-mail-from-citizen', 'route-received-mail', function( envelope ){
    var recipient_specified = 'to' in envelope,
        recipient_type = recipient_specified ? 'citizen' : 'supervisor',
        action = 'route-received-mail',
        success = false,
        error;

    switch( recipient_type ){

      case 'supervisor':
        supervisor.hook.run( 'supervisor-mail', envelope );
        success = true;
      break;

      case 'citizen':
        var recipient = supervisor.get( envelope.to );

        if( ! recipient ){
          error = 'no registered citizen with name "'+ envelope.to +'"';
          break;
        }

        recipient.mail.inbox.push( envelope );
        success = true;

        if( recipient.mail.inbox.length === 1 ) supervisor.hook.run( envelope.to + '-inbox-no-longer-empty' );
      break;

      default:
        error = 'no routing strategy specified for recipient type "'+ recipient_type +'"';
      break;
    }

    if( ! success ) console.log({ action: action, success: success, error: error });
  });
}