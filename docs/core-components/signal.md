# [Supe](../../README.md) > [Core Components](../core-components.md) > Signal

## Signal

### About
Signal is a simple lightweight way to send a message from one entity ( citizen, supervisor ) to another.

Signal is Supe's lowest level inter-entity communication tool. While lightweight and fast, it lacks enough features to use directly for all inter-entity communication. No built-in mechanism for a signal's recipient to reply the sender.

Despite these constraints, signal is a powerful solid building block for fancier messaging features and patterns. Supervision, mail and noticeboard all use signal to coordinate between two entities.

If you're building custom or shareable Supe addons, Signal makes sense. Otherwise, you might get more value looking at communication tools that build on Signal and provide additional guarantees. 

For example: 
- Noticeboard is a signal that gets broadcasted to all entities, rather than a specific one.
- Mail is signal that persists in the mailbox til the citizen processes and confirms it has been.

`supervisor`
```js
var supe = require('supe')(),
    signal_recipient = 'citizen-kane',
    citizen = supe.get( signal_recipient );

citizen.signal.send( 'HELLO-CITIZEN' )
``` 

`citizen`
```js
var citizen = require('supe');

// to fellow citizen
  citizen.signal.send({ to: 'citizen-kane' }, 'HELLO-FELLOW-CITIZEN' );

// to supervisor
  citizen.signal.send( 'HELLO-SUPE' );
```