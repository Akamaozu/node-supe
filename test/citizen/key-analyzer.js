var supe = require('../../index');

supe.mail.receive( function( envelope, ack ){
  var key = envelope.msg,
      res = { type: 'key-analysis', key: key, success: true };

  // bail if key is not a string
    if( typeof key !== 'string' ){
      res.success = false;
      res.error = 'key given is not a string';
      supe.mail.send( res );
      return ack();
    }

  res.exists = supe.hasOwnProperty( key );

  // bail if key doesn't exist
    if( !res.exists ){
      supe.mail.send( res );
      return ack();
    }

  res.typeof = typeof supe[ key ];
  res.tostring = Object.prototype.toString.call( supe[ key ] );

  supe.mail.send( res );
  return ack();
});

// wait ten secs before shutting down
  setTimeout( process.exit, 10000 );