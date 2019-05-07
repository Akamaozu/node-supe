var merge = require('merge-objects'),
    add_mail_to_citizen_inbox = require( './actions/add-mail-to-citizen-inbox' );

module.exports = function( supervisor, config ){

  supervisor.hook.add( 'citizen-registration', 'setup-mail-module', function( citizen ){
    citizen.mail = {};
    citizen.mail.inbox = [];
    citizen.mail.send = send_mail;

    citizen.state.pause_mail = true;

    function send_mail( settings, msg ){
      if( arguments.length == 1 ){
        msg = settings;
        settings = {};
      }

      var envelope = merge({ from: 'supe', type: 'mail' }, settings );
      envelope.msg = msg;

      add_mail_to_citizen_inbox( supervisor, citizen, envelope );
    };
  });
}