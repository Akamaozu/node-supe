# [Supe](../../README.md) > [Core Components](../core-components.md) > Supervision

## Supervisor

### Create Supervisor
```js
var supervisor = require('supe')();
```

### Supervise Citizens
Supervise a citizen by registering and starting it. The supervisor will restart server.js whenever it crashes.
```js
supervisor.register( 'server', 'server.js' );
supervisor.start( 'server ');

// or
supervisor.start( 'server', 'server.js' );
```

### Set Citizen's Overcrash

NOTE: Supe will stop reviving a citizen after it crashes excessively.

```js
var supervisor = require('supe')(),
    server = supervisor.start( 'server', 'server.js', { retries: 3, duration: 1 });

// if server.js crashes more than three times in one minute, supe considers it overcrashed
```

### Set Default Overcrash

```js
var supervisor = require('supe')({ retries: 3, duration: 1 }),
    server = supervisor.start( 'server', 'server.js' ),
    worker = supervisor.start( 'worker', 'worker.js' );

// all supervised scripts will use the default overcrash thresholds
// individual overcrash thresholds override defaults

var worker2 = supervisor.start( 'worker2', 'worker.js', { retries: 20 }),
    worker3 = supervisor.start( 'worker3', 'worker.js', { duration: 1 });
```

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