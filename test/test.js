var assert = require('assert'),
    supe = require('../index');

describe('Supe Test Suite', function(){

  describe('About Supe', function(){

    it('is a function', function(){

      assert.equal(typeof supe, 'function', 'is not a function');
    });
  });

  describe('Supervisor (Instantiated Supe) Properties', function(){

    var supervisor = supe(),
        expected_properties = [ 'is_registered', 'register', 'deregister', 'start', 'stop', 'get', 'use', 'noticeboard', 'hook' ];

    it('has its own "is_registered" function', function(){
      assert.equal( supervisor.hasOwnProperty('is_registered') && typeof supervisor.is_registered === 'function', true, 'didn\'t instantiate with its own "is_registered" function');
    });

    it('has its own "register" function', function(){
      assert.equal( supervisor.hasOwnProperty('register') && typeof supervisor.register === 'function', true, 'didn\'t instantiate with its own "register" function');
    });

    it('has its own "deregister" function', function(){
      assert.equal( supervisor.hasOwnProperty('deregister') && typeof supervisor.deregister === 'function', true, 'didn\'t instantiate with its own "deregister" function');
    });

    it('has its own "start" function', function(){
      assert.equal( supervisor.hasOwnProperty('start') && typeof supervisor.start === 'function', true, 'didn\'t instantiate with its own "start" function');
    });

    it('has its own "stop" function', function(){
      assert.equal( supervisor.hasOwnProperty('stop') && typeof supervisor.stop === 'function', true, 'didn\'t instantiate with its own "stop" function');
    });

    it('has its own "get" function', function(){
      assert.equal( supervisor.hasOwnProperty('get') && typeof supervisor.get === 'function', true, 'didn\'t instantiate with its own "get" function');
    });

    it('has its own "use" function', function(){
      assert.equal( supervisor.hasOwnProperty('use') && typeof supervisor.use === 'function', true, 'didn\'t instantiate with its own "get" function');
    });

    it('has its own "noticeboard" object', function(){
      assert.equal( supervisor.hasOwnProperty('noticeboard') && Object.prototype.toString.call( supervisor.noticeboard ) === '[object Object]', true, 'didn\'t instantiate with its own "noticeboard" object');
    });

    it('has its own "hook" object', function(){
      assert.equal( supervisor.hasOwnProperty('hook') && Object.prototype.toString.call( supervisor.hook ) === '[object Object]', true, 'didn\'t instantiate with its own "noticeboard" object');
    });

    it('has no unexpected properties', function(){
      for( var prop in supervisor ){
        assert.equal( expected_properties.indexOf( prop ) > -1, true, 'has unexpected property "' + prop + '"' );
      }
    });

    it('"noticeboard" is an instance of cjs-noticeboard', function(){
      assert.equal( supervisor.noticeboard instanceof require('cjs-noticeboard'), true, 'not an instance of cjs-noticeboard');
    });
  });

  describe('Supervisor Functions Behavior', function(){

    describe('Supervisor.is_registered', function(){
      var citizen_name = 'logger',
          supervisor;

      before( function(){
        supervisor = supe();
        supervisor.register( citizen_name, './test/citizen/interval-logger' );
      });

      it('returns true if citizen is registered', function(){
        assert.equal( supervisor.is_registered( citizen_name ), true, 'did not return true for registered citizen name' );
      });

      it('returns false is citizen is not registered', function(){
        assert.equal( supervisor.is_registered( 'unregistered-citizen' ), false, 'did not return false for unregistered citizen name' );
      });

      it('returns false if given citizen name is not a string', function(){
        var nonstrings = [ 1, [], {}, function(){} ];

        nonstrings.forEach( function( nonstring ){
          var registered = supervisor.is_registered( nonstring );
          assert.equal( registered, false, 'citizen was registered with a non-string name parameter' );
        });
      });
    });

    describe('Supervisor.register', function(){
      var supervisor,
          new_process;

      beforeEach( function(){
        supervisor = supe();
        new_process = supervisor.register( 'logger', './test/citizen/interval-logger' );
      });

      it('returns a Promsie', function( done ){
        assert.equal( new_process instanceof Promise, true, 'did not return a Promise' );
        setTimeout( done, 0 );
      });

      it('returns an object (citizen) from Promise', function( done ){
        new_process.then( ( citizen ) => {
          assert.equal( Object.prototype.toString.call( citizen ) === '[object Object]', true, 'did not return an object' );
          setTimeout( done, 0 );
        } );
      });

      it('will not create a new citizen without name parameter', function( done ){

        supervisor.register( null, './test/citizen/interval-logger' )
        .then( () => {
          assert.equal( false === true , true, 'citizen was created without name parameter' );
          setTimeout( done, 0 );
        } )
        .catch( ( err ) => {
          setTimeout( done, 0 );
        } );
      });

      it('will not create a new citizen without file parameter', function( done ){

        supervisor.register( 'fileless-citizen' )
        .then( () => {
          assert.equal( false === true , true, 'citizen was created without file parameter' );
          setTimeout( done, 0 );
        } )
        .catch( ( err ) => {
          setTimeout( done, 0 );
        } );
      });

      it('will not create a new citizen if file parameter is not a string', function( done ){
        var nonstrings = [ 1, [], {}, function(){} ];

        Promise.all(
          nonstrings.map(
            ( nonstring ) => supervisor.register( 'nonstring-file-citizen', nonstring )
          )
        )
        .then( () => {
          assert.equal( false === true, true, 'citizen was created with a non-string file parameter' );
          setTimeout( done, 0 );
        } )
        .catch( () => {
          setTimeout( done, 0 );
        } );
      });

      it('will not create a new citizen if name is associated with a different citizen', function( done ){
        var overwrite_error = false;

        supervisor.register( 'common-citizen', './test/citizen/one-time-logger' )
        .then( () => {
          supervisor.register( 'common-citizen', './test/citizen/interval-logger' )
          .then( () => {
            assert.equal( false === true, true, 'new citizen was registered under the name of an existing citizen' );
            setTimeout( done, 0 );
          } )
          .catch( () => {
            setTimeout( done, 0 );
          } );
        } )
        .catch( () => {
          assert.equal( false === true, true, 'new citizen was registered under the name of an existing citizen / fail' );
          setTimeout( done, 0 );
        } );
      });

      it('will pass parameters to citizen\'s config', function( done ){
        var params = { retries: 5, duration: 5, happy: true };
        supervisor.register( 'custom-logger', './test/citizen/one-time-logger', params )
        .then( ( citizen ) => {
          for( var prop in params ){
            if( !params.hasOwnProperty( prop ) ) continue;

            assert.equal( citizen.config.hasOwnProperty( prop ), true, 'citizen config does not have expected property "' + prop + '"' );
            assert.equal( citizen.config[ prop ] === params[ prop ], true, 'parameter property "' + prop + '" does not match citizen config\'s "' + prop + '"' );
          }
          setTimeout( done, 0 );
        } );
      });

      it('will override default citizen\'s config', function( done ){
        var supervisor = supe();
        supervisor.register( 'default-logger', './test/citizen/one-time-logger' )
        .then( ( default_logger ) => {
          supervisor.register( 'custom-logger', './test/citizen/one-time-logger', { retries: 5, duration: 5, happy: true })
          .then( ( custom_logger ) => {
            assert.equal( default_logger.config !== custom_logger.config, true, 'config for default and custom loggers are identical' );
            setTimeout( done, 0 );
          } );
        } );
      });
    });

    describe('Supervisor.deregister', function(){
      var supervisor,
          new_process;

      beforeEach( function(){
        supervisor = supe();
        new_process = supervisor.register( 'logger', './test/citizen/interval-logger' );
      } );

      it('returns a Promsie', function( done ){
        new_process
        .then( () => {
          assert.equal( supervisor.deregister( 'logger' ) instanceof Promise, true, 'did not return a Promise' );
          setTimeout( done, 0 );
        } );
      });

      it('removes a registed citizen', function( done ){
        const citizen_name = 'logger';
        new_process.then( () => {
          assert.equal( supervisor.is_registered( citizen_name ), true, 'is not registerd the first time' );
          supervisor.deregister( citizen_name )
          .then( () => {
            assert.equal( supervisor.is_registered( citizen_name ), false, 'citizen was not deregisterd' );
            done();
          })
          .catch( () => done() );
        } )
        .catch( () => done() );
      });

      it('removes a running registed citizen', function( done ){
        const citizen_name = 'logger';
        new_process
        .then( () => supervisor.start( citizen_name ) )
        .then( () => supervisor.deregister( citizen_name ) )
        .then( () => {
          assert.equal( supervisor.is_registered( citizen_name ), false, 'citizen was not deregisterd' );
          setTimeout( done, 0 ) ;
        } )
        .catch( () => setTimeout( done, 0 ) );
      });
    });

    describe('Supervisor.start', function(){
      var supervisor,
          new_process;

      beforeEach( function(){
        supervisor = supe();
        new_process = supervisor.start( 'logger', './test/citizen/interval-logger' );
      });

      afterEach( function(){
        supervisor.stop( 'logger' ).catch( () => {} );
        new_process = null;
      });

      it('returns a Promsie', function( done ){
        assert.equal( new_process instanceof Promise, true, 'did not return a Promise' );
        setTimeout( done, 0 );
      });

      it('citizen has a process reference ("ref" property)', function( done ){
        new_process.then( ( citizen ) => {
          assert.equal( citizen.hasOwnProperty( 'ref' ), true, 'citizen does not have ref property' );
          setTimeout( done, 0 );
        });
      });

      it('citizen\'s process reference ("ref" property) is a node child_process instance', function( done ){
        new_process.then( ( citizen ) => {
          assert.equal( citizen.ref instanceof require('events'), true, 'citizen "ref" property is not an event emitter' );
          assert.equal( citizen.ref.hasOwnProperty( 'stdout' ), true, 'citizen.ref does not have expected property "stdout"' );
          assert.equal( citizen.ref.stdout instanceof require('events'), true, 'new process reference property "stdout" is not an event emitter' );
          assert.equal( citizen.ref.hasOwnProperty( 'stderr' ), true, 'new process reference does not have expected property "stderr"' );
          assert.equal( citizen.ref.stderr instanceof require('events'), true, 'new process reference property "stderr" is not an event emitter' );
          setTimeout( done, 0 );
        } );
      });

      it('will restart a previously-started citizen', function( done ){
        var citizen_name = 'logger';

        new_process
        .then( () => supervisor.stop( citizen_name ) )
        .then( () => supervisor.start( citizen_name ) )
        .then( () => setTimeout( done, 0 ) )
        .catch( () => {
          assert.equal( false === true, true, 'first and second start refer to the same process instance' );
          setTimeout( done, 0 );
        } );
      });

      it('will not restart a currently-running citizen', function( done ){

        new_process
        .then(() => {
          supervisor.start( 'logger' )
          .then( () => {
            assert.equal( false === true, true, 'restarted currently-running process' );
            setTimeout( done, 0 );
          } )
          .catch( () => {
            setTimeout( done, 0 );
          } );
        });
      });
    });

    describe('Supervisor.stop', function(){
      var supervisor,
          new_process;

      beforeEach( function(){
        supervisor = supe();
        new_process = supervisor.start( 'logger', './test/citizen/interval-logger' );
      });

      it('returns a Promsie', function( done ){
        new_process
        .then( () => {
          assert.equal( supervisor.stop( 'logger' ) instanceof Promise, true, 'did not return a Promise' );
          setTimeout( done, 0 );
        } );
      });

      it('stops a process', function( done ){
        new_process.then( ( citizen ) => {
          assert.equal( citizen.hasOwnProperty( 'ref' ), true, 'citizen does not have ref property' );
          supervisor.stop( 'logger' )
          .then( ( new_citzen ) => {
            assert.equal( new_citzen.hasOwnProperty( 'ref' ), false, 'citizen still has ref property' );
            setTimeout( done, 0 );
          } )
          .catch( () => setTimeout( done, 0 ) );
        });
      });
    });

    describe('Supervisor.get', function(){
      var supervisor = supe();

      it('returns citizen with given name if it exists', function( done ){
        supervisor.start( 'logger', './test/citizen/interval-logger' )
        .then( (citizen) => {
          var get_val = supervisor.get( 'logger' );
          assert.equal( citizen === get_val, true, 'get return value does not match created citizen' );

          // cleanup
            supervisor.stop( 'logger' );

          done();
        } );
      });

      it('returns false if citizen with given name does not exist', function(){
        var get_val = supervisor.get( 'non-existent-logger' );

        assert.equal( Object.prototype.toString.call( get_val ) !== ['object Object'], true, 'returned an object, not false' );
      });

      it('returns false if given name is not a string', function(){
        var non_strings = [ 1, {}, [], null, false, NaN ];

        non_strings.forEach( function( non_string ){
          var get_val = supervisor.get( non_string );

          assert.equal( Object.prototype.toString.call( get_val ) !== ['object Object'], true, 'returned an object, not false' );
        });
      });
    });

    describe('Supervisor.use', function(){
      var supervisor = supe();

      it('executes given function with current Supervisor as first argument', function(){
        var unique_key = Date.now();

        supervisor.use( set_unique_key_module );

        assert.equal( supervisor.hasOwnProperty( 'is_same_instance' ) === true, true, 'supervisor instance does not have prop "is_same_instance"' );
        assert.equal( supervisor.is_same_instance === unique_key, true, 'supervisor prop "is_same_instance" does not match expected value' );

        function set_unique_key_module( supe ){
          supe.is_same_instance = unique_key;
        }
      });

      it('does nothing and returns false if first argument is false-y', function(){
        var falsey_values = [ false, 0, '', null, undefined ];

        falsey_values.forEach( function( falsey ){
          assert.equal( supervisor.use( falsey ) === false, true, 'expected false, got something else' );
        });
      });

      it('throws an error if first argument is not a function', function(){
        var non_functions = [
          { type: 'number', val: 1 },
          { type: 'string', val: '1' },
          { type: 'array', val: ['1'] },
          { type: 'object', val: { a: '1' } }
        ]

        non_functions.forEach( function( non_func ){
          var error_thrown = false;

          try {
            supervisor.use( non_func.val );
          }
          catch( e ){
            error_thrown = true;
          }

          assert.equal( error_thrown === true, true, 'error not thrown when given ' + non_func.type + ' argument' );
        });
      });
    });
  });

  describe('Supervisor Noticeboard Integration', function(){
    var supervisor;

    beforeEach( function(){
      supervisor = supe({ retries: 0 });
    });

    it('sends notice "(name)-registered" when citizen is registered', function( done ){
      var registered = false;

      supervisor.noticeboard.once( 'one-time-crasher-registered', 'do-assertions', function( msg ){
        registered = true;

        assert.equal( registered, true, 'did not detect specific citizen registration' );
        done();
      });

      supervisor.register( 'one-time-crasher', './test/citizen/one-time-crasher', { retries: 0 } );
    });

    it('sends notice "citizen-registered" when any citizen is registered', function( done ){
      this.timeout( 10000 );

      var first_citizen_name = 'first-crasher',
          second_citizen_name = 'second-crasher',
          registrations_detected = 0;

      supervisor.noticeboard.watch( 'citizen-registered', 'do-assertions', function( msg ){
        registrations_detected += 1;

        var details = msg.notice;

        if( details.name !== second_citizen_name ) return;

        assert.equal( registrations_detected === 2, true, 'did not detect all citizen registrations' );
        assert.equal( details.name === second_citizen_name, true, 'did not detect expected citizen registration' );

        done();
      });

      supervisor.register( first_citizen_name, './test/citizen/one-time-crasher' );
      supervisor.register( second_citizen_name, './test/citizen/one-time-crasher' );
    });

    it('sends notice "(name)-started" when citizen is started', function( done ){
      this.timeout( 10000 );

      var started = false;

      supervisor.noticeboard.once( 'one-time-crasher-started', 'do-assertions', function( msg ){
        started = true;

        assert.equal( started, true, 'did not detect specific citizen start-up' );
        done();

        // cleanup
          supervisor.get( 'one-time-crasher' ).ref.kill();
      });

      supervisor.start( 'one-time-crasher', './test/citizen/one-time-crasher', { retries: 0 } );
    });

    it('sends notice "citizen-started" when any citizen is started', function( done ){
      this.timeout( 10000 );

      var first_citizen_name = 'first-crasher',
          second_citizen_name = 'second-crasher',
          startups_detected = 0;

      supervisor.noticeboard.watch( 'citizen-started', 'do-assertions', function( msg ){

        startups_detected += 1;

        var details = msg.notice;

        if( details.name !== second_citizen_name ) return;

        assert.equal( startups_detected === 2, true, 'did not detect all citizen start' );
        assert.equal( details.name === second_citizen_name, true, 'did not detect expected citizen start' );

        done();
      });

      supervisor.start( first_citizen_name, './test/citizen/one-time-crasher' );
      supervisor.start( second_citizen_name, './test/citizen/one-time-crasher' );
    });

    it('sends notice "(name)-shutdown" when a citizen shuts down', function( done ){
      this.timeout( 15000 );

      var detected_shutdown = false;

      supervisor.noticeboard.watch( 'one-time-logger-shutdown', 'do-assertions', function( msg ){
        detected_shutdown = true;

        assert.equal( detected_shutdown === true, true, 'did not detect specific citizen shutdown' );
        done();
      });

      supervisor.start( 'one-time-logger', './test/citizen/one-time-logger' );
    });

    it('sends notice "citizen-shutdown" when any citizen shuts down', function( done ){
      this.timeout( 10000 );

      var first_citizen_name = 'first-logger',
          second_citizen_name = 'second-logger',
          shutdowns_detected = 0,
          shutdowns = [];

      supervisor.noticeboard.watch( 'citizen-shutdown', 'do-assertions', function( msg ){
        shutdowns_detected += 1;

        var citizen_name = msg.notice.name;
        shutdowns.push( citizen_name );

        if( shutdowns_detected < 2 ) return;

        var detected_shutdown_from_both_citizens = shutdowns.indexOf( first_citizen_name ) > -1 && shutdowns.indexOf( second_citizen_name ) > -1;

        assert.equal( detected_shutdown_from_both_citizens, true, 'did not detect expected citizen shutdown' );
        done();
      });

      supervisor.start( first_citizen_name, './test/citizen/one-time-logger' );
      supervisor.start( second_citizen_name, './test/citizen/one-time-logger' );
    });

    it('sends notice "(name)-crashed" on crash', function( done ){

      this.timeout( 10000 );

      var detected_crash = false;

      supervisor.noticeboard.once( 'one-time-crasher-crashed', 'do-assertions', function( msg ){

        detected_crash = true;
        assert.equal( detected_crash, true, 'did not detect specific citizen crash' );
        done();
      });

      supervisor.start( 'one-time-crasher', './test/citizen/one-time-crasher', { retries: 0 } );
    });

    it('sends notice "citizen-crashed" when any citizen crashes', function( done ){

      this.timeout( 15000 );

      var first_citizen_name = 'first-crasher',
          second_citizen_name = 'second-crasher',
          crashes_detected = 0;

      supervisor.noticeboard.watch( 'citizen-crashed', 'do-assertions', function(){

        crashes_detected += 1;

        if( crashes_detected < 2 ) return;

        assert.equal( crashes_detected === 2, true, 'did not detect all citizen crashes' );
        done();
      });

      supervisor.start( first_citizen_name, './test/citizen/one-time-crasher' );
      supervisor.start( second_citizen_name, './test/citizen/one-time-crasher' );
    });

    it('sends notice "(name)-auto-restarted" when crashed citizen is restarted', function( done ){

      this.timeout( 10000 );

      var name = 'one-time-crasher',
          detected_crash = false;

      supervisor.noticeboard.once( name + '-auto-restarted', 'do-assertions', function( msg ){

        detected_crash = true;
        assert.equal( detected_crash, true, 'did not detect specific citizen auto-restart' );
        done();
      });

      supervisor.start( name, './test/citizen/one-time-crasher', { retries: 1 } );
    });

    it('sends notice "citizen-auto-restarted" when any crashed citizen is restarted', function( done ){

      this.timeout( 5000 );

      var first_citizen_name = 'first-crasher',
          second_citizen_name = 'second-crasher',
          restarts_detected = 0;

      supervisor.noticeboard.watch( 'citizen-auto-restarted', 'do-assertions', function( msg ){

        restarts_detected += 1;

        if( restarts_detected < 2 ) return;

        assert.equal( restarts_detected === 2, true, 'did not detect all citizen restarts' );
        done();
      });

      supervisor.start( first_citizen_name, './test/citizen/one-time-crasher', { retries: 1 });
      supervisor.start( second_citizen_name, './test/citizen/one-time-crasher', { retries: 1 });
    });
  });

  describe('Citizen Properties', function(){
    var supervisor,
        key_analyzer;

    beforeEach( function(){
      supervisor = supe();
      key_analyzer = supervisor.start( 'key-analyzer', './test/citizen/key-analyzer' );
    });

    it( 'has its own "get_name" function', function( done ){
      this.timeout( 5000 );

      key_analyzer.then( (analyzer) => {
        var key = 'get_name',
            expected_typeof = 'function';

        supervisor.noticeboard.watch( 'supervisor-message', 'process-analysis', function( msg ){
          var envelope = msg.notice,
              message = envelope.msg;

          if( ! message.type || message.type !== 'key-analysis' ) return;

          var analysis = message;
          if( analysis.key != key ) return;
          if( analysis.success != true ) throw new Error( 'citizen analysis of supe key "' + analysis.key + '" failed' );

          assert.equal( analysis.exists, true, '"' + key + '" does not exist on citizen supe instance' );
          assert.equal( analysis.typeof, expected_typeof, '"' + key + '" is not a ' + expected_typeof );
          done();
        });

        analyzer.mail.send( key );
      } );
    });
  });

  describe('Supervisor Behavior', function(){

    this.timeout( 10000 );

    var supervisor;

    beforeEach( function(){
      supervisor = supe();
    });

    it('will automatically restart a crashed citizen', function( done ){

      this.timeout( 10000 );

      var citizen_name = 'crasher';

      supervisor.noticeboard.once( citizen_name + '-auto-restarted', 'do-assertions', function( msg ){

        var details = msg.notice,
            citizen = supervisor.get( citizen_name );

        assert.equal( citizen.ref && citizen.ref.stdout && citizen.ref instanceof require('events'), true, 'restarted citizen does not have reference to valid child process' );
        done();
      });

      supervisor.start( citizen_name, './test/citizen/one-time-crasher', { retries: 1 });
    });

    it('will not automatically restart citizen that crashed excessively', function( done ){
      this.timeout( 10000 );

      var citizen_name = 'crasher',
          max_restarts = 2,
          restarts = 0;

      supervisor.noticeboard.watch( citizen_name + '-auto-restarted', 'count-auto-restarts', function(){
        restarts += 1;

        if( restarts > max_restarts ) done( new Error( 'restarted citizen more than permitted amount of times' ) );
      });

      supervisor.noticeboard.watch( citizen_name + '-excessive-crash', 'do-assertions', function(){

        // wait a second before doing assertions, just in case
          setTimeout( function(){

            assert.equal( restarts === max_restarts, true, 'current restarts does not match max allowed restarts' );
            done();
          }, 1000 );
      });

      supervisor.start( citizen_name, './test/citizen/one-time-crasher', { retries: max_restarts });
    });

    it('will route mail sent by a citizen to addressed citizen', function( done ){

      this.timeout( 10000 );

      supervisor.noticeboard.watch( 'supervisor-message', 'do-assertions', function( msg ){

        var envelope = msg.notice;

        if( envelope.type !== 'mail' ) return;
        if( envelope.from !== 'routed-mail-receiver' ) return;
        if( envelope.msg.received_mail_from !== 'routed-mail-sender' ) return;

        done();
      });

      supervisor.start( 'routed-mail-receiver', './test/citizen/routed-mail-receiver' );
      supervisor.start( 'routed-mail-sender', './test/citizen/routed-mail-sender' );
    });

    it('will requeue unacked mail if a citizen crashes', function( done ){
      this.timeout( 10000 );

      var name = 'unacker',
          message = 'CRASH';

      supervisor.start( name, './test/citizen/unacked-mail', { retries: 0 })
      .then( (citizen) => {
        supervisor.noticeboard.once( name + '-crashed', 'do-assertions', function( msg ){

          assert.equal( citizen.state.current_mail === null, true, 'citizen should not have current mail in its state' );
          assert.equal( citizen.mail.inbox.length === 1, true, 'inbox does not contain expected amount of mail' );
          assert.equal( citizen.mail.inbox[0].msg === message, true, 'content of message on queue does not match sent message' );
          done();
        });

        citizen.mail.send( message );
      } );
    });

    it('will requeue unacked mail if a citizen shuts down', function( done ){

      this.timeout( 10000 );

      var name = 'unacker',
          message = 'SHUTDOWN';

      supervisor.start( name, './test/citizen/unacked-mail', { retries: 0 })
      .then( (citizen) => {
        supervisor.noticeboard.once( name + '-shutdown', 'do-assertions', function( msg ){

          assert.equal( citizen.state.current_mail === null, true, 'citizen should not have current mail in its state' );
          assert.equal( citizen.mail.inbox.length === 1, true, 'inbox does not contain expected amount of mail' );
          assert.equal( citizen.mail.inbox[0].msg === message, true, 'content of message on queue does not match sent message' );
          done();
        });

        citizen.mail.send( message );
      });
    });

    it('will cache citizen notices', function( done ){

      supervisor.start( 'notice-sender', './test/citizen/notice-sender' );

      setTimeout( check_cache_for_citizen_notice, 888 );

      function check_cache_for_citizen_notice(){
        var notice_cache = supervisor.noticeboard.cache[ 'sample-notice-from-citizen' ];

        if( ! notice_cache ) return;
        if( notice_cache !== 'hello supervisor' ) return;

        done();
      }
    });
  });

  describe('Citizen Behavior', function(){
    var supervisor;

    beforeEach( function(){
      supervisor = supe();
    });

    it('can pause flow of inbound mail', function( done ){
      this.timeout( 10000 );

      var name = 'pauser',
          paused_at,
          pause_duration_ms;

      supervisor.noticeboard.watch( 'supervisor-message', 'handle-mail', function( msg ){

        var envelope = msg.notice,
            content;

        if( !envelope.msg ) return;

        content = envelope.msg;

        if( content.pause_for ){

          paused_at = content.paused_at;
          pause_duration_ms = content.pause_for;
        }

        if( content.received === 'do assertions' ){

          var received_at = Date.now(),
              processed = received_at - paused_at;

          assert.equal( processed >= pause_duration_ms, true, 'mail was processed in ' + processed + 'ms but pause duration is ' + pause_duration_ms + 'ms' );
          done();

          // cleanup
          supervisor.stop( name );
        }
      });

      supervisor.start( name, './test/citizen/paused-mail', { retries: 0 })
      .then( (citizen) => {
        citizen.mail.send( 'PAUSE' );
        citizen.mail.send( 'do assertions' );
      });
    });
  });

  describe('Citizen Noticeboard Integration', function(){
    var supervisor;

    beforeEach( function(){
      supervisor = supe({ retries: 0 });
    });

    it('can watch a notice on supervisor\'s noticeboard', function( done ){
      this.timeout( 10000 );

      var citizen_name = 'notice-receiver',
          sample_notice = 'sample-notice',
          sample_message = 'hello citizen',
          citizen;

      supervisor.noticeboard.watch( 'ready-to-receive-notices', 'send-sample-notice', function( msg ){
        var ready_citizen = msg.notice.citizen;
        if( ready_citizen !== citizen_name ) return;

        supervisor.noticeboard.notify( sample_notice, sample_message );
        supervisor.noticeboard.ignore( 'ready-to-receive-notices', 'send-sample-notice' );
      });

      supervisor.noticeboard.watch( 'supervisor-message', 'do-assertions', function( msg ){
        if( msg.notice.type !== 'mail' ) return;

        var content = msg.notice.msg;
        if( !content.received || !content.notice ) return;

        assert.equal( content.notice, sample_notice, 'received notice is not what was sent' );
        assert.equal( content.received, sample_message, 'received message is not what was sent' );

        done();

        // cleanup
          citizen.ref.kill();
      });

      citizen = supervisor.start( citizen_name, './test/citizen/notice-receiver', { retries: 0 });
    });

    it('can "watch once" a notice on supervisor\'s noticeboard', function( done ){
      this.timeout( 10000 );

      var citizen_name = 'notice-receiver',
          sample_notice = 'sample-notice',
          sample_message = 'hello citizen',
          citizen_responses = 0,
          citizen;

      supervisor.noticeboard.watch( 'ready-to-receive-notices', 'send-sample-notices', function( msg ){
        var ready_citizen = msg.notice.citizen;
        if( ready_citizen != citizen_name ) return;

        supervisor.noticeboard.notify( sample_notice, sample_message );
        supervisor.noticeboard.notify( sample_notice, sample_message );
        supervisor.noticeboard.notify( sample_notice, sample_message );

        supervisor.noticeboard.ignore( 'ready-to-receive-notices', 'send-sample-notices' );
      });

      supervisor.noticeboard.watch( 'supervisor-message', 'do-assertions', function( msg ){
        if( msg.notice.type !== 'mail' ) return;

        var content = msg.notice.msg;
        if( !content.received || !content.notice ) return;

        citizen_responses += 1;
      });

      citizen = supervisor.start( citizen_name, './test/citizen/notice-once-receiver', { retries: 0 });

      setTimeout( function(){
        assert.equal( citizen_responses, 1 );
        done();

        // cleanup
          citizen.ref.kill();
      }, 1500 );
    });

    it('will ignore duplicate notice pipe requests to supervisor\'s noticeboard', function( done ){
      this.timeout(10000);

      var sample_notice = 'sample-notice',
          failed = false,
          citizen;

      supervisor.noticeboard.notify( sample_notice, 42 );

      supervisor.noticeboard.once( 'double-piper-crashed', 'fail-test', function(){
        failed = true;
      });

      citizen = supervisor.start( 'double-piper', './test/citizen/duplicate-notice-sender', { retries: 0 });

      setTimeout( function(){
        assert.equal( failed, false );
        done();

        // cleanup
          citizen.ref.kill();
      }, 3000 );
    });

    it('can post a notice on supervisor\'s noticeboard', function( done ){
      this.timeout( 10000 );

      supervisor.noticeboard.watch( 'sample-notice-from-citizen', 'do-assertions', function( msg ){
        done();
      });

      supervisor.start( 'notice-sender', './test/citizen/notice-sender', { retries: 0 });
    });

    it('can use supervisor\'s noticeboard cache', function( done ){

      this.timeout( 5000 );

      var payload_to_cache = { success: true };

      // handle citizen's response to cache test
        supervisor.noticeboard.watch( 'supervisor-message', 'assess-cache-access', access_cache_access );

      // cache payload
        supervisor.noticeboard.notify( 'sample-notice', payload_to_cache );

      supervisor.start( 'cache-accesser', './test/citizen/cache-accesser' );

      function access_cache_access( msg ){

        var envelope = msg.notice;

        if( envelope.type !== 'mail' ) return;
        if( envelope.from !== 'cache-accesser' ) return;

        var response = envelope.msg.received,
            payload_matches_cache = true;

        for( var key in payload_to_cache ){
          if( ! payload_to_cache.hasOwnProperty( key ) ) continue;

          if( ! response.hasOwnProperty( key ) ) payload_matches_cache = false;
          if( payload_to_cache[ key ] != response[ key ] ) payload_matches_cache = false;

          break;
        }

        if( payload_matches_cache ) done();
      }
    });
  });
});
