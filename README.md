# Supe

# Fault-Tolerance Framework for Node.js Apps

[![npm version](https://badge.fury.io/js/supe.svg)](https://badge.fury.io/js/supe) [![travis ci](https://travis-ci.org/Akamaozu/node-supe.svg?branch=master)](https://travis-ci.org/Akamaozu/node-supe) [![Coverage Status](https://coveralls.io/repos/github/Akamaozu/node-supe/badge.svg?branch=master)](https://coveralls.io/github/Akamaozu/node-supe?branch=master)

# Intro

## Why You Should Care About Fault Tolerance

Your coworkers, mentors and heroes write faulty code. **You** write faulty code.

JavaScript isn’t particularly forgiving when code fails, so your app rolls over and stays dead. While we have many tools for bringing a dead Node.js app back to life, we typically don’t structure them in ways that limit the problem's impact on the app.

**Fault Tolerance reduces the impact problems have on your app**. At worst you’ll have a bottleneck in a component, but it won’t bring everything else to a grinding halt, or worse yet, send it to the big farm in the cloud.

## Why You Should Try A Framework for Fault Tolerance

You definitely don’t need one but a framework makes it **really easy to start** making things more fault-tolerant while providing **a common platform for building, sharing ideas and tools** the same way Express.js does for writing web servers.

## How Supe Can Help

While making your app more fault-tolerance is very rewarding, it is a VERY HARD THING™.

- You need ways to communicate between formerly-cozy components.
- Each component now outputs data to a different stdout.
- Even though each component is still single-threaded, your overall application is now multi-threaded.

This is just the tip of the iceberg of concerns introduced by trying to be fault-tolerance.

Supe helps by providing good default solutions for these problems and allows you to modify (or overwrite) any particular one so you can implement the solution that works best for your specific challenge.

# Install
```js
npm install --save supe
```

# Getting Started

## Supervisors and Citizens

The first step to fault-tolerance is breaking your app into separate parts.

For example, instead of one file with multiple responsibilities like:

```js
// inside app.js
var http = express(),
    db = db_driver(),
    ws = websocket();
```

We're moving towards separate programs with individual responsibilities and the app becomes their manager / coordinator.

```js
// inside app.js
var http = supervisor.start( 'http', 'http.js' ),
    db = supervisor.start( 'db', 'db-driver.js'),
    ws = supervisor.start( 'ws', 'websocket.js');
```

Supe refers to the manager / coordinator as a supervisor; the components are called citizens.

## Setup Supervisor

### Create
```js
var supervisor = require('supe')();
```

### Supervise Citizens
```js
// supervise server.js
supervisor.register( 'server', 'server.js' );
supervisor.start( 'server ');

// or
supervisor.start( 'server', 'server.js' );

// supervisor will restart server.js whenever it crashes
```

## Basic Config

### Set Citizen Overcrash

NOTE: Supe will stop reviving a citizen after it crashes excessively.

```js
var supervisor = require('supe')(),
    server = supervisor.start( 'server', 'server.js', { retries: 3, duration: 3 });

// if server.js crashes more than three times in three minutes, supe considers it overcrashed
```

### Set Default Overcrash

```js
var supervisor = require('supe')({ retries: 3, duration: 3 }),
    server = supervisor.start( 'server', 'server.js' ),
    worker = supervisor.start( 'worker', 'worker.js' );

// all supervised scripts will use the default overcrash thresholds
// individual overcrash thresholds override defaults

var worker2 = supervisor.start( 'worker2', 'worker.js', { retries: 20 }),
    worker3 = supervisor.start( 'worker3', 'worker.js', { duration: 1 });
```

## Advanced Use

### Notices (Events)

#### About
Supe uses [cjs-noticeboard](https://www.npmjs.com/package/cjs-noticeboard "cjs-noticeboard on npm") to send out notices when certain actions happen. This makes it easy to extend Supe to build custom behavior for your supervisor.

All you need to do is watch a relevant notice and your code will be executed every time a notice is sent out.

#### Watch a Notice

Example:
```js
// tell pagerduty component to send alert when component crashes excessively
  supervisor.noticeboard.watch( 'citizen-excessive-crash', 'send-pagerduty-alert', function( msg ){
    
    var data = msg.notice,
        citizen = data.name,
        pagerduty = supervisor.get( 'pagerduty' );

    pagerduty.mail.send({
      action: 'send-alert',
      message: citizen + ' crashed excessively at ' + Date()
    });
  });
```

#### More About Notices

### Mail

#### About
Mail is a simple yet reliable way to communicate between components. With a few lines of code, you can send some data to a citizen. When the citizen starts receiving data, hopefully they'll know what to do with what you sent.

Mail is more reliable than notices because they are stored on the supervisor regardless of citizen's state. When the citizen is ready to receive mail, they're sent in the same order they were received by the supervisor.

#### Send

```js
// inside citizen
var supe = require('supe');

// to supervisor
supe.mail.send( 'hello supervisor' );

// to other citizen
supe.mail.send({ to: 'worker-two' }, 'hello worker two' );
```

#### Receive

```js
// inside citizen

var supe = require('supe');

supe.mail.receive( function( envelope, ack ){

  var sender = envelope.from,
      content = envelope.msg;

  console.log( 'message from ' + sender + ': ' + content );

  ack();
});
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

#### More About Mail

### Supervised Supervisors

Supervised scripts can supervise other scripts.

```js
// inside supervisor.js

var supervisor = require('supe')();

supervisor.start( 'worker', 'worker.js' );

// inside worker.js

var supe = require('supe'),
    supervisor = supe();

supervisor.start( 'subworker', 'sub-worker.js' );

if( supe.supervised ) supe.mail.send( 'started a subworker' );
```