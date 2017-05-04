var merge = require('merge-objects');

module.exports = function( supervisor, config ){

  supervisor.middleware.add( 'citizen-registration', function( citizen ){

    citizen.mail = {};
    citizen.mail.inbox = [];
    citizen.mail.send = send_mail;

    function send_mail( settings, msg ){

      if( !msg ){

        msg = settings;
        settings = {};
      }

      var envelope = merge({ from: 'supe', type: 'mail' }, settings );

      envelope.msg = msg;

      citizen.mail.inbox.push( envelope );

      if( citizen.mail.inbox.length === 1 ) supervisor.noticeboard.notify( citizen.name + '-inbox-no-longer-empty' );
    };
  });   
}