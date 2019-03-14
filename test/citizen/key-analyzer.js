var citizen = require('../../index');

citizen.hook.add( 'citizen-mail', 'handle-key-analysis', function( envelope, handle_mail ){
  var ack = handle_mail(),
      key = envelope.msg,
      res = { type: 'key-analysis', key: key, success: true };

  // bail if key is not a string
    if( typeof key !== 'string' ){
      res.success = false;
      res.error = 'key given is not a string';
      citizen.mail.send( res );
      return ack();
    }

  res.exists = citizen.hasOwnProperty( key );

  // bail if key doesn't exist
    if( ! res.exists ){
      citizen.mail.send( res );
      return ack();
    }

  res.typeof = typeof citizen[ key ];
  res.tostring = Object.prototype.toString.call( citizen[ key ] );

  citizen.mail.send( res );
  ack();
});

citizen.mail.receive();

// wait ten secs before shutting down
  setTimeout( process.exit, 10000 );