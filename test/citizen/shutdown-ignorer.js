var supe = require('../../index');

supe.hook.add( 'shutdown', 'refuse-to-shutdown', function( delay_shutdown ){
  console.log( 'hooked into shutdown sequence' );

  var release_delay = delay_shutdown();
  console.log( 'requested shutdown delay. release key:', release_delay );

  // hold release indefinitely
});

console.log( 'added shutdown hook that holds release indefinitely' );