var merge = require('merge-objects');

module.exports = function( citizen, config ){

  if( !citizen.hasOwnProperty( 'mail' ) ) citizen.mail = {};

  citizen.mail.send = function send_mail( settings, msg ){

    if( !msg ){

      msg = settings;
      settings = {};
    }

    var envelope = merge({ type: 'mail' }, settings );

    envelope.msg = msg;

    process.send( envelope );
  };
}