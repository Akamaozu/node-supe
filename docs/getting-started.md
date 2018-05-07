# [Supe](../README.md) > Getting Started

The first key change is making the entry point of your program a [supervisor instance](core-components/supervision.md#1).

For example, if your program is currently started by running `node server.js`, you can:

1. Create a new entry point file, like `node app.js`.
2. Make `app.js` a supervisor.
```
// inside app.js
var supervisor = require('supe')();
```
3. Register (and run) the previous entry point as a Supe citizen of `app.js`.
```
// inside app.js
var server = supervisor.start( 'server', 'server.js' );
```