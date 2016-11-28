Supe
===

# Erlang-inspired Process Supervision Library

## Install
```js
npm install --save supe
```

## Basic Use

### Setup

```js

var supe = require('supe'),
    supervisor = supe(),
    server = supervisor.start( 'server', 'server.js' );

// starts up server.js on a supervised process
// supe will restart server.js whenever it crashes

```

## Basic Config

### Set Script Overcrash

NOTE: By default supe does nothing when a script overcrashes. It will keep reviving even when the script over-crashes. See [Handling Overcrashes](#handling-overcrashes) for ways to deal with excessive crashes.  

```js

var supe = require('supe'),
    supervisor = supe(),
    server = supervisor.start( 'server', 'server.js', { retries: 3, duration: 3 });

// if server.js crashes more than three times in three minutes, supe considers it overcrashed

```

### Set Default Overcrash

```js

var supe = require('supe'),
    supervisor = supe({ retries: 3, duration: 3 }),
    server = supervisor.start( 'server', 'server.js' ),
    worker = supervisor.start( 'worker', 'worker.js' );

// all supervised scripts will use the default overcrash thresholds
// individual overcrash thresholds override defaults

var worker2 = supervisor.start( 'worker2', 'worker.js', { retries: 20 }),
    worker3 = supervisor.start( 'worker3', 'worker.js', { duration: 1 });

```

## Advanced Use

### Noticeboard

Supe uses [cjs-noticeboard](https://www.npmjs.com/package/cjs-noticeboard "cjs-noticeboard on npm") internally to coordinate its moving parts. 

Watch for these internal notices using the exposed noticeboard instance.

```js

// log pipe worker two output
  supervisor.noticeboard.watch( 'worker2-output', 'pipe-to-console', function( msg ){

    var output = msg.notice;

    console.log( '[worker2] ' + output );
  });

// log pipe worker three errors
  supervisor.noticeboard.watch( 'worker3-error', 'pipe-to-console', function( msg ){

    var error = msg.notice.toString();

    console.log( '[worker3][error] ' + error );
  });

// log shutdowns
  supervisor.noticeboard.watch( 'citizen-shutdown', 'log-shutdowns', function( msg ){
    
    var name = msg.notice;

    console.log( name + ' shut down' );
  });

// log overcrashes
  supervisor.noticeboard.watch( 'citizen-excessive-crash', 'log-excessive-crashes', function( msg ){
    
    var name = msg.notice;

    console.log( name + ' crashed more than permitted threshold' );
  });

// crash when worker two overcrashes
  supervisor.noticeboard.watch( 'citizen-excessive-crash', 'log-excessive-crashes', function( msg ){
    
    var name = msg.notice;

    if( name !==  'worker2' ) return;

    throw new Error( 'worker 2 crashed excessively' );
  });

```

### Send Messages

Supervised scripts can send messages to supe.

```js
  
// inside worker.js

var supe = require('supe');

if( supe.supervised ){

  supe.mail.send( 'hello supervisor' );
}

```

Supervised scripts can route messages through supe to other supervised scripts.

```js

// inside server.js

var supe = require('supe');

if( supe.supervised ){

  supe.mail.send({ to: 'worker3' }, 'hello worker three' );  
}

// inside worker.js

if( supe.supervised ){
  
  supe.mail.receive( function( envelope, ack ){

    var sender = envelope.from,
        content = envelope.msg;

    console.log( 'message from ' + sender + ': ' + content );

    ack();
  });
}

```

Messages don't have to be strings.

```js

// inside server.js

supe.mail.send({ key: 'concurrent-users', value: 9001 });

```

Supervised scripts are given one message at a time. 

No more messages will be sent til the current one is acknowledged ( ack() ).

Once you acknowledge a message, the next message is automatically sent.

```js

// worker one
  
for( var x = 1; x <= 100; x += 1 ){
  
  supe.mail.send({ to: 'worker3' }, x );
}

// worker two
  
for( var x = 100; x >= 1; x -= 1 ){
  
  supe.mail.send({ to: 'worker3' }, x );
}

// worker three
  
supe.mail.receive( function( envelope, ack ){

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

You can temporarily stop receiving messages.

None will be lost because supervisor stores them until supervised script is ready to receive again.

```js

// inside worker.js
  
supe.mail.receive( function( envelope, ack ){

  var sender = envelope.from,
      content = envelope.msg;

  supe.mail.pause();

  ack();

  // acknowledging this mail does not resume stream of inbound messages.

  // resume mail stream in thirty minutes

  setTimeout( supe.mail.receive, 30 * 60 * 1000 );
});

```

Change the mail receive callback whenever you want.
( foundation of actor model? )

```js

function callback1( envelope, ack ){

  var sender = envelope.from,
      content = envelope.msg;

  console.log( 'callback one used!' );

  supe.mail.receive( callback2 );

  ack();
}

function callback2( envelope, ack ){

  var sender = envelope.from,
      content = envelope.msg;

  console.log( 'callback two used!' );

  supe.mail.receive( callback1 );

  ack();
}
  
supe.mail.receive( callback1 );

// callback one used!
// callback two used!
// callback one used!
// callback two used!
// callback one used!
// callback two used!

```

Unacknowledged mails will be returned to the top of the mailbox if a supervised script crashes or shuts down without acknowledging the message it had received.

```js

// worker one
  
for( var x = 1; x <= 100; x += 1 ){
  
  supe.mail.send({ to: 'worker2' }, x );
}

// worker two

console.log( 'worker2 started' );
  
supe.mail.receive( function( envelope, ack ){

  var sender = envelope.from,
      content = envelope.msg;

  console.log( sender + ' says: ' + content );

  throw new Error( 'chaos monkey strikes' );
});

// worker2 started
// worker1 says 1
// worker2 started
// worker1 says 1
// worker2 started
// worker1 says 1
```

### Supervised Supervisors

Supervised scripts can supervise other scripts.

```js

// inside supervisor.js

var supe = require('supe'),
    supervisor = supe();

supervisor.start( 'worker', 'worker.js' );

// inside worker.js

var supe = require('supe'),
    supervisor = supe();

supervisor.start( 'subworker', 'sub-worker.js' );

if( supe.supervised ){
  
  supe.mail.send( 'started a subworker' );
}

``` 

## Tips

### Handling Overcrashes

#### 1. Crash the supervisor

```js
supervisor.noticeboard.watch( 'citizen-excessive-crash', 'crash-supervisor', function( msg ){
  
  var name = msg.notice;

  throw new Error( name + ' crashed excessively' );
});

#### 1. Stop (and maybe restart) script

```js
supervisor.noticeboard.watch( 'citizen-excessive-crash', 'crash-supervisor', function( msg ){
  
  var name = msg.notice,
      citizen = supe.get( name );

  citizen.ref.exit();

  // restart in 30 secs

  setTimeout( function(){

    supe.start( name );
  
  }, 30 * 1000 );

  // you don't need to resupply the file parameter to start.
  // Supe is already aware of the script, so it will simply restart it.
  // its mailbox will remain intact this way.
});
```