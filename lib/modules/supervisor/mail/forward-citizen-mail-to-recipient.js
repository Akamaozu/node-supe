module.exports = function( supervisor, config ){
  
  supervisor.noticeboard.watch( 'received-mail-from-citizen', 'forward-mail-to-citizen-inbox', function( msg ){

    var envelope = msg.notice;

    if( !envelope.to ) return;

    var recipient = supervisor.get( envelope.to );

    if( !recipient ) return console.log( new Error( 'dropped message from "' + envelope.from + '" to "' + envelope.to + '" -- recipient does not exist' ) );

    recipient.mail.inbox.push( envelope );

    if( recipient.mail.inbox.length === 1 ) supervisor.noticeboard.notify( envelope.to + '-inbox-no-longer-empty' );
  });

  supervisor.noticeboard.watch( 'received-mail-from-citizen', 'publish-supervisor-mail', function( msg ){

    var envelope = msg.notice;

    if( envelope.to ) return; 

    supervisor.noticeboard.notify( 'supervisor-message', envelope );
  });
}