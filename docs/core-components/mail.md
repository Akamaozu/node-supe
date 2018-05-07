# [Supe](../../README.md) > [Core Components](../core-components.md) > Mail

## Mail

### About
Mail is a simple yet reliable way to communicate between components. With a few lines of code, you can send some data to a citizen. When the citizen starts receiving data, hopefully they'll know what to do with what you sent.

Mail is more reliable than notices because they are stored on the supervisor regardless of citizen's state. When the citizen is ready to receive mail, they're sent in the same order they were received by the supervisor.

### Send

```js
// inside citizen
var citizen = require('supe');

// to supervisor
citizen.mail.send( 'hello supervisor' );

// to other citizen
citizen.mail.send({ to: 'worker-two' }, 'hello worker two' );
```

### Receive

```js
// inside citizen

var citizen = require('supe');

citizen.mail.receive( function( envelope, ack ){

  var sender = envelope.from,
      content = envelope.msg;

  console.log( 'message from ' + sender + ': ' + content );

  ack();
});
```

Messages don't have to be strings.

```js
// inside server.js

citizen.mail.send({ key: 'concurrent-users', value: 9001 });
```

Supervised scripts are given one message at a time. 

No more messages will be sent til the current one is acknowledged ( ack() ).

Once you acknowledge a message, the next message is automatically sent.

```js
// worker one
  
for( var x = 1; x <= 100; x += 1 ){  
  citizen.mail.send({ to: 'worker3' }, x );
}

// worker two
  
for( var x = 100; x >= 1; x -= 1 ){  
  citizen.mail.send({ to: 'worker3' }, x );
}

// worker three
  
citizen.mail.receive( function( envelope, ack ){

  var sender = envelope.from,
      content = envelope.msg;

  console.log( sender + ' says: ' + content );
  ack();
});

// worker1 says 1
// worker2 says 100
// worker1 says 2
// worker2 says 99
// worker1 says 3
// worker2 says 98
// worker1 says 4
// worker2 says 97
```