# [Supe](../../README.md) > [Core Components](../core-components.md) > Noticeboard

## Noticeboard

### About
Supe uses [cjs-noticeboard](https://www.npmjs.com/package/cjs-noticeboard "cjs-noticeboard on npm") to send out notices when certain actions happen. This makes it easy to extend Supe to build custom behavior for your supervisor.

All you need to do is watch a relevant notice and your code will be executed every time a notice is sent out.

### Watch a Notice

```js
// tell pagerduty component to send alert when component crashes excessively

  supervisor.noticeboard.watch( 'citizen-excessive-crash', 'send-pagerduty-alert', function( msg ){
    var citizen_name = msg.notice.name,
        pagerduty = supervisor.get( 'pagerduty' );

    pagerduty.mail.send({
      action: 'send-alert',
      message: citizen_name + ' crashed excessively at ' + Date()
    });
  });
```