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
        expected_properties = [ 'is_registered', 'register', 'start', 'get', 'use', 'noticeboard', 'middleware' ];

    it('has its own "register" function', function(){   

      assert.equal( supervisor.hasOwnProperty('register') && typeof supervisor.register === 'function', true, 'didn\'t instantiate with its own "register" function');
    });

    it('has its own "start" function', function(){   

      assert.equal( supervisor.hasOwnProperty('start') && typeof supervisor.start === 'function', true, 'didn\'t instantiate with its own "start" function');
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

    it('has its own "middleware" object', function(){   

      assert.equal( supervisor.hasOwnProperty('middleware') && Object.prototype.toString.call( supervisor.middleware ) === '[object Object]', true, 'didn\'t instantiate with its own "noticeboard" object');
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

    describe('Supervisor.register', function(){
      
      var supervisor,
          new_process; 

      beforeEach( function(){

        supervisor = supe();
        new_process = supervisor.register( 'logger', './test/citizen/interval-logger' );
      });

      it('returns an object (citizen)', function( done ){

        assert.equal( Object.prototype.toString.call( new_process ) === '[object Object]', true, 'did not return an object' );
        setTimeout( done, 0 );
      });

      it('will not create a new citizen without name parameter', function(){

        var crashed = false;

        try{

          supervisor.register( null, './test/citizen/interval-logger' );
        }

        catch( e ){ crashed = true; }

        assert.equal( crashed === true , true, 'citizen was created without name parameter' );
      });

      it('will not create a new citizen without file parameter', function(){

        var failed = false;

        try{

          supervisor.register( 'fileless-citizen' );
        }

        catch( e ){ failed = true }

        assert.equal( failed === true, true, 'citizen was created without file parameter' );
      });

      it('will not create a new citizen if file parameter is not a string', function(){

        var nonstrings = [ 1, [], {}, function(){} ];

        nonstrings.forEach( function( nonstring ){

          var failed = false;

          try{

            supervisor.register( 'nonstring-file-citizen' );
          }

          catch( e ){ failed = true; }

          assert.equal( failed === true, true, 'citizen was created with a non-string file parameter' );
        });
      });

      it('will not create a new citizen if name is associated with a different citizen', function(){

        var overwrite_error = false;

        supervisor.register( 'common-citizen', './test/citizen/one-time-logger' );

        try{

          common_citizen_2 = supervisor.register( 'common-citizen', './test/citizen/interval-logger' );
          console.log(  common_citizen_2 );
        }

        catch( e ){ overwrite_error = true; }

        assert.equal( overwrite_error === true, true, 'new citizen was registered under the name of an existing citizen' );
      });

      it('will pass parameters to citizen\'s config', function(){

        var supervisor = supe(),
            params = { retries: 5, duration: 5, happy: true },
            citizen = supervisor.register( 'custom-logger', './test/citizen/one-time-logger', params );

        for( var prop in params ){

          if( !params.hasOwnProperty( prop ) ) continue;

          assert.equal( citizen.config.hasOwnProperty( prop ), true, 'citizen config does not have expected property "' + prop + '"' );            
          assert.equal( citizen.config[ prop ] === params[ prop ], true, 'parameter property "' + prop + '" does not match citizen config\'s "' + prop + '"' );            
        }
      });

      it('will override default citizen\'s config', function(){

        var supervisor = supe(),
            default_logger = supervisor.register( 'default-logger', './test/citizen/one-time-logger' ),
            custom_logger = supervisor.register( 'custom-logger', './test/citizen/one-time-logger', { retries: 5, duration: 5, happy: true });

        assert.equal( default_logger.config !== custom_logger.config, true, 'config for default and custom loggers are identical' );
      });
    });

    describe('Supervisor.start', function(){
      
      var supervisor,
          new_process; 

      beforeEach( function(){

        supervisor = supe();
        new_process = supervisor.start( 'logger', './test/citizen/interval-logger' );
      });

      it('citizen has a process reference ("ref" property)', function(){
        assert.equal( new_process.hasOwnProperty( 'ref' ), true, 'citizen does not have ref property' );
      });

      it('citizen\'s process reference ("ref" property) is a node child_process instance', function(){
        assert.equal( new_process.ref instanceof require('events'), true, 'citizen "ref" property is not an event emitter' );
        assert.equal( new_process.ref.hasOwnProperty( 'stdout' ), true, 'citizen.ref does not have expected property "stdout"' );
        assert.equal( new_process.ref.stdout instanceof require('events'), true, 'new process reference property "stdout" is not an event emitter' );
        assert.equal( new_process.ref.hasOwnProperty( 'stderr' ), true, 'new process reference does not have expected property "stderr"' );
        assert.equal( new_process.ref.stderr instanceof require('events'), true, 'new process reference property "stderr" is not an event emitter' );
      });

      it('will restart a previously-started citizen', function( done ){

        this.timeout( 10000 );

        supervisor.noticeboard.watch( 'citizen-shutdown', 'start-tests', function( msg ){

          var second_start = supervisor.start( 'one-time-logger' );

          assert.equal( Object.prototype.toString.call( second_start ) === '[object Object]', true, 'second start attempt did not return an object as expected' );
          assert.equal( second_start.hasOwnProperty( 'ref' ), true, 'second start attempt did not return with a process reference (property "ref")' );
          assert.equal( first_pid !== second_start.ref.pid || first_start.ref !== second_start.ref, true, 'first and second start are the same instance' );

          supervisor.noticeboard.ignore( 'citizen-shutdown', 'start-tests' );

          done();
        });

        var first_start = supervisor.start( 'one-time-logger', './test/citizen/one-time-logger' ),
            first_pid = first_start.ref.pid;
      });

      it('will not restart a currently-running citizen', function( done ){

        var new_citizen_started = false,
            test_completed = false;

        supervisor.noticeboard.watch( 'logger-started', 'fail-test', function(){
          new_citizen_started = true;
          complete_test();
        });

        setTimeout( complete_test, 1000 );

        supervisor.start( 'logger' );

        function complete_test(){
          if( test_completed ) return;
          test_completed = true;

          assert.equal( new_citizen_started, false, 'restarted currently-running process' );
          done();
        }
      });
    });

    describe('Supervisor.get', function(){

      supervisor = supe();

      it('returns citizen with given name if it exists', function(){

        var citizen = supervisor.start( 'logger', './test/citizen/interval-logger' ),
            get_val = supervisor.get( 'logger' );

        assert.equal( citizen === get_val, true, 'get return value does not match created citizen' );
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

      supervisor = supe();

      it('executes given function with current Supervisor as first argument', function(){

        var unique = Date.now(),
            module = function( supe ){

            supe.is_same_instance = unique;
          }

        supervisor.use( module );

        assert.equal( supervisor.hasOwnProperty( 'is_same_instance' ) === true, true, 'supervisor instance does not have prop "is_same_instance"' );
        assert.equal( supervisor.is_same_instance === unique, true, 'supervisor prop "is_same_instance" does not match expected value' );
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

      this.timeout( 10000 );

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

      this.timeout( 15000 );
      
      var first_citizen_name = 'first-logger',
          second_citizen_name = 'second-logger',
          shutdowns_detected = 0;

      supervisor.noticeboard.watch( 'citizen-shutdown', 'do-assertions', function( msg ){

        shutdowns_detected += 1;

        var details = msg.notice;

        if( details.name !== second_citizen_name ) return;
        
        assert.equal( shutdowns_detected === 2, true, 'did not detect all citizen shutdowns' );
        assert.equal( details.name === second_citizen_name, true, 'did not detect expected citizen shutdown' );
        
        done();
      });

      supervisor.start( first_citizen_name, './test/citizen/one-time-logger' );

      setTimeout( function(){
        supervisor.start( second_citizen_name, './test/citizen/one-time-logger' );
      }, 2000 );
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

      key_analyzer.mail.send( key );
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

      this.timeout( 0 );

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
          message = 'CRASH',
          citizen; 

      supervisor.noticeboard.once( name + '-crashed', 'do-assertions', function( msg ){

        assert.equal( citizen.state.current_mail === null, true, 'citizen should not have current mail in its state' );
        assert.equal( citizen.mail.inbox.length === 1, true, 'inbox does not contain expected amount of mail' );
        assert.equal( citizen.mail.inbox[0].msg === message, true, 'content of message on queue does not match sent message' );
        done();
      });

      citizen = supervisor.start( name, './test/citizen/unacked-mail', { retries: 0 });

      citizen.mail.send( message );
    });

    it('will requeue unacked mail if a citizen shuts down', function( done ){

      this.timeout( 10000 );

      var name = 'unacker',
          message = 'SHUTDOWN',
          citizen; 

      supervisor.noticeboard.once( name + '-shutdown', 'do-assertions', function( msg ){

        assert.equal( citizen.state.current_mail === null, true, 'citizen should not have current mail in its state' );
        assert.equal( citizen.mail.inbox.length === 1, true, 'inbox does not contain expected amount of mail' );
        assert.equal( citizen.mail.inbox[0].msg === message, true, 'content of message on queue does not match sent message' );
        done();
      });

      citizen = supervisor.start( name, './test/citizen/unacked-mail', { retries: 0 });

      citizen.mail.send( message ); 
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

    it('can pause flow of inbound mail', function( done ){

      this.timeout( 10000 );

      var name = 'pauser',
          citizen,
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
        }
      });

      citizen = supervisor.start( name, './test/citizen/paused-mail', { retries: 0 });

      citizen.mail.send( 'PAUSE' );
      citizen.mail.send( 'do assertions' );
    });
  });

  describe('Citizen Noticeboard Integration', function(){

    var supervisor;
    
    beforeEach( function(){
      supervisor = supe({ retries: 0 });
    });

    it('can watch a notice on supervisor\'s noticeboard', function( done ){

      var sample_notice = 'sample-notice',
          sample_message = 'hello citizen';

      this.timeout( 10000 );

      supervisor.noticeboard.watch( 'citizen-output', 'log', function( msg ){

        console.log( '[' + msg.notice.name + '] ' + msg.notice.output );
      });

      supervisor.noticeboard.watch( 'supervisor-message', 'do-assertions', function( msg ){

        if( msg.notice.type !== 'mail' ) return;

        var content = msg.notice.msg;

        if( !content.received || !content.notice ) return;

        assert.equal( content.notice, sample_notice, 'received notice is not what was sent' );
        assert.equal( content.received, sample_message, 'received message is not what was sent' );

        done();
      });

      supervisor.start( 'notice-receiver', './test/citizen/notice-receiver', { retries: 0 });

      setTimeout( function(){

        supervisor.noticeboard.notify( sample_notice, sample_message );
      }, 3000 );
    });

    it('can "watch once" a notice on supervisor\'s noticeboard', function( done ){

      var sample_notice = 'sample-notice',
          sample_message = 'hello citizen',
          citizen_responses = 0;

      this.timeout( 10000 );

      supervisor.noticeboard.watch( 'citizen-output', 'log', function( msg ){

        console.log( '[' + msg.notice.name + '] ' + msg.notice.output );
      });

      supervisor.noticeboard.watch( 'supervisor-message', 'do-assertions', function( msg ){

        if( msg.notice.type !== 'mail' ) return;

        var content = msg.notice.msg;

        if( !content.received || !content.notice ) return;

        citizen_responses += 1;
      });

      supervisor.start( 'notice-receiver', './test/citizen/notice-once-receiver', { retries: 0 });

      setTimeout( function(){

        supervisor.noticeboard.notify( sample_notice, sample_message );
        supervisor.noticeboard.notify( sample_notice, sample_message );
        supervisor.noticeboard.notify( sample_notice, sample_message );
      }, 3000 );

      setTimeout( function(){

        assert.equal( citizen_responses, 1 );
        done();
      }, 9000 );
    });

    it('will ignore duplicate notice pipe requests to supervisor\'s noticeboard', function( done ){

      this.timeout(10000);

      var sample_notice = 'sample-notice',
          failed = false;

      supervisor.noticeboard.notify( sample_notice, 42 );

      supervisor.noticeboard.watch( 'double-piper-output', 'print', function( msg ){
        var output = msg.notice;
        console.log( 'output: ', output.output );
      });

      supervisor.noticeboard.watch( 'double-piper-error', 'print', function( msg ){
        var output = msg.notice;
        console.log( 'error: ', output.error );
      });

      supervisor.noticeboard.watch( 'double-piper-crashed', 'fail-test', function(){
        failed = true;
        console.log( 'double piper crashed' );
      });

      supervisor.start( 'double-piper', './test/citizen/duplicate-notice-sender', { retries: 0 });

      setTimeout( function(){

        assert.equal( failed, false );
        done();
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