module.exports = function( supervisor ){
  
  supervisor.hook.add( 'citizen-signal', 'handle-mail-related-signals', function( msg ){

    var envelope = msg.notice;
    
    if( !envelope || !envelope.from || !envelope.signal ) return;

    switch( envelope.signal ){

      case 'READY-TO-RECEIVE-MAIL':

        var citizen = supervisor.get( envelope.from );

        if( !citizen || citizen.state.current_mail ) return;
        
        citizen.state.pause_mail = false;

        if( citizen.mail.inbox.length > 0 ){

          citizen.state.current_mail = citizen.mail.inbox.splice( 0, 1 )[0];

          citizen.ref.send( citizen.state.current_mail );
        }

        else {

          if( citizen.state.waiting_for_mail ) return;

          citizen.state.waiting_for_mail = true;

          supervisor.noticeboard.once( envelope.from + '-inbox-no-longer-empty', 'send-mail-to-ready-citizen', function( msg ){

            citizen.state.waiting_for_mail = false;

            if( citizen.state.pause_mail ) return;              

            citizen.state.current_mail = citizen.mail.inbox.splice( 0, 1 )[0];

            citizen.ref.send( citizen.state.current_mail );
          });
        }

      break;

      case 'ACK-CURRENT-MAIL':

        var citizen = supervisor.get( envelope.from );

        if( !citizen || !citizen.state.current_mail ) return;

        citizen.state.current_mail = null;

        if( citizen.state.pause_mail ) return;
        
        if( citizen.mail.inbox.length > 0 ){

          citizen.state.current_mail = citizen.mail.inbox.splice( 0, 1 )[0];

          citizen.ref.send( citizen.state.current_mail );
        }

        else{

          if( citizen.state.waiting_for_mail ) return;

          citizen.state.waiting_for_mail = true;

          supervisor.noticeboard.once( envelope.from + '-inbox-no-longer-empty', 'send-mail-to-ready-citizen', function( msg ){

            citizen.state.waiting_for_mail = false;

            if( citizen.state.pause_mail ) return;              

            citizen.state.current_mail = citizen.mail.inbox.splice( 0, 1 )[0];

            citizen.ref.send( citizen.state.current_mail );
          });
        } 

      break;

      case 'NOT-READY-TO-RECEIVE-MAIL':

        var citizen = supervisor.get( envelope.from );

        if( !citizen ) return;

        citizen.state.pause_mail = true;            

      break;
    }
  });
}