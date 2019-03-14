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
        expected_properties = [
          { key: 'is_registered', type: 'function' },
          { key: 'deregister', type: 'function' },
          { key: 'register', type: 'function' },
          { key: 'start', type: 'function' },
          { key: 'stop', type: 'function' },
          { key: 'get', type: 'function' },
          { key: 'use', type: 'function' },
          { key: 'noticeboard', type: 'object' },
          { key: 'hook', type: 'object' }
        ],
        expected_properties_index = [];

    expected_properties.forEach( function( prop ){
      it( 'has its own "' + prop.key + '" ' + prop.type, function(){
        assert.equal( supervisor.hasOwnProperty( prop.key ), true, 'has no "' + prop.key + '" property' );

        switch( prop.type ){
          case 'function':
            assert.equal( typeof supervisor[ prop.key ], 'function', '"' + prop.key + '" is not a function' );
          break;

          case 'object':
            assert.equal( Object.prototype.toString.call( supervisor[ prop.key ] ), '[object Object]', '"' + prop.key + '" is not a function' );
          break;

          default:
            throw new Error( 'no tests defined for '+ prop.type +' data-type' );
          break;
        }

        expected_properties_index.push( prop.key );
      });
    });

    it('has no unexpected properties', function(){
      for( var prop in supervisor ){
        assert.equal( expected_properties_index.indexOf( prop ) > -1, true, 'has unexpected property "' + prop + '"' );
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
        }

        catch( e ){ overwrite_error = true; }

        assert.equal( overwrite_error === true, true, 'new citizen was registered under the name of an existing citizen' );
      });

      it('will pass parameters to citizen\'s config', function(){
        var params = { retries: 5, duration: 5, happy: true },
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

    describe('Supervisor.deregister', function(){
      var supervisor = supe(),
          citizen_name = 'citizen-to-deregister';

      afterEach( function(){
        if( supervisor.get( citizen_name ) ) supervisor.deregister( citizen_name );
        supervisor = supe();
      });

      it('will remove a citizen from supe\'s registry', function(){
        supervisor.register( citizen_name, './test/citizen/interval-logger' );
        supervisor.deregister( citizen_name );

        assert.equal( supervisor.get( citizen_name ), false, 'citizen still exists' );
      });

      it('will stop a running citizen before deregistering it', function( done ){
        this.timeout( 10000 );

        var stopped = false;

        supervisor.start( citizen_name, './test/citizen/interval-logger' );

        supervisor.hook.add( citizen_name + '-stopped', 'mark-stopped', function(){
          stopped = true;
        });

        supervisor.hook.add( citizen_name + '-deregistered', 'do-assertions', function(){
          var citizen = supervisor.get( citizen_name ),
              citizen_exists = citizen && citizen != false && citizen != null;

          assert.equal( citizen_exists, false, 'citizen was not deregistered' );
          assert.equal( stopped, true, 'citizen was not stopped' );

          done();
        });

        supervisor.deregister( citizen_name );
      });
    });

    describe('Supervisor.start', function(){
      var supervisor,
          new_process; 

      beforeEach( function(){
        supervisor = supe();
      });

      it('citizen has a process reference ("ref" property) that is a node child_process', function( done ){
        this.timeout( 10000 );

        var new_process = supervisor.start( 'logger', './test/citizen/interval-logger' );

        assert.equal( new_process.hasOwnProperty( 'ref' ), true, 'citizen does not have ref property' );
        assert.equal( new_process.ref instanceof require('child_process').ChildProcess, true, 'citizen "ref" property is not a child process' );

        // cleanup
        supervisor.hook.add( 'logger-stopped', 'done', function(){
          done();
        });

        supervisor.stop( 'logger' );
      });

      it('will restart a previously-started citizen', function( done ){
        this.timeout( 10000 );

        var citizen_name = 'one-time-logger',
            citizen = supervisor.register( citizen_name, './test/citizen/one-time-logger' ),
            first_start_ref,
            second_start_ref,
            started = 0;

        supervisor.hook.add( citizen_name + '-started', 'do-assertions', function(){
          started += 1;

          switch( started ){
            case 1:
              first_start_ref = citizen.ref;

              supervisor.hook.add( citizen_name + '-shutdown', 'restart-citizen', function(){
                supervisor.hook.del( citizen_name + '-shutdown', 'restart-citizen' );
                supervisor.start( citizen_name );
              });              
            break;

            case 2:
              supervisor.hook.del( citizen_name + '-started', 'do-assertions' );

              second_start_ref = citizen.ref;

              assert.equal( first_start_ref !== second_start_ref, true, 'first and second start refer to the same process instance' );
              done();

              // cleanup
                citizen.ref.kill();              
            break;

            default:
              throw new Error( 'citizen "' + citizen_name + '" started more times than expected' );
            break;
          }
        });

        supervisor.start( citizen_name );
      });

      it('will not restart a currently-running citizen', function( done ){
        var new_citizen_started = false,
            test_completed = false;

        supervisor.hook.add( 'logger-started', 'fail-test', function(){
          new_citizen_started = true;
          complete_test();
        });

        setTimeout( complete_test, 888 );

        try {
          supervisor.start( 'logger' );
        }

        catch(e){
          complete_test();
        }

        function complete_test(){
          if( test_completed ) return;

          test_completed = true;

          assert.equal( new_citizen_started, false, 'restarted currently-running process' );
          done();
        }
      });
    });

    describe('Supervisor.stop', function(){
      var supervisor = supe(),
          citizen_name, citizen;

      afterEach( function(){
        if( ! citizen || ! citizen.ref ) return;

        citizen.ref.kill();
        citizen_name = citizen = null;
      });

      it('will stop a running citizen', function( done ){
        this.timeout( 20000 );

        citizen_name = 'nodejs-app-no-supe';
        citizen = supervisor.start( citizen_name, './test/citizen/notice-once-receiver' );

        var stopped = false;

        supervisor.hook.add( citizen_name + '-stopped', 'do-assertions', function( msg ){
          stopped = true;
          do_assertions();
        });

        supervisor.stop( citizen_name );

        function do_assertions(){
          done();
          assert.equal( stopped, true, '"' + citizen_name + '" was not stopped' );
        }
      });

      it('will eventually stop a citizen that refuses to shutdown', function( done ){
        this.timeout( 10000 );

        var citizen_stopped = false;

        citizen_name = 'shutdown-ignorer';
        citizen = supervisor.register( citizen_name, './test/citizen/shutdown-ignorer' );

        supervisor.hook.add( citizen_name + '-started', 'stop-it', function(){
          supervisor.stop( citizen_name );
        });

        supervisor.hook.add( citizen_name + '-stopped', 'do-assertions', function(){
          citizen_stopped = true;

          assert.equal( citizen_stopped, true, 'citizen was not stopped' );
          done();
        });

        supervisor.start( citizen_name  );
      });

      it('throws error if given name is not a string', function(){
        var non_strings = [ 1, {}, [], null, false, NaN ],
            errors_thrown = 0;

        non_strings.forEach( function( non_string ){
          try {
            supervisor.stop( non_string );
          }
          catch(e){
            errors_thrown += 1;
          }
        });

        assert.equal( errors_thrown == non_strings.length, true, 'errors thrown does not match number of non strings tested' );
      });

      it('throws error if citizen with given name does not exist', function(){
        var error_thrown = false;

        try{
          supervisor.stop( 'non-existent-citizen' );
        }
        catch(e) {
          error_thrown = true;
        }

        assert.equal( error_thrown, true, 'no error thrown when stopping non-existent citizen' );
      });
    });

    describe('Supervisor.get', function(){
      var supervisor = supe();

      it('returns citizen with given name if it exists', function( done ){
        var citizen = supervisor.start( 'logger', './test/citizen/interval-logger' ),
            get_val = supervisor.get( 'logger' );

        assert.equal( citizen === get_val, true, 'get return value does not match created citizen' );

        // cleanup
          supervisor.hook.add( 'logger-stopped', 'end-test', function(){
            done();
          });

          supervisor.stop( 'logger' );
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

      var key = 'get_name',
          expected_typeof = 'function';

      supervisor.hook.add( 'supervisor-mail', 'process-analysis', function( envelope ){
        var message = envelope.msg;

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

      supervisor.hook.add( citizen_name + '-auto-restarted', 'do-assertions', function( msg ){
        var details = msg.notice,
            citizen = supervisor.get( citizen_name );

        supervisor.hook.del( citizen_name + '-auto-restarted', 'do-assertions' );

        assert.equal( citizen.ref && citizen.ref.stdout && citizen.ref instanceof require('events'), true, 'restarted citizen does not have reference to valid child process' );

        // cleanup
          supervisor.hook.add( citizen_name + '-stopped', 'end test', function(){
            done();
          });

          supervisor.stop( citizen_name );
      });

      supervisor.start( citizen_name, './test/citizen/one-time-crasher', { retries: 1 });
    });

    it('will not automatically restart citizen that crashed excessively', function( done ){
      this.timeout( 10000 );

      var citizen_name = 'crasher',
          max_restarts = 2,
          restarts = 0;

      supervisor.hook.add( citizen_name + '-auto-restarted', 'count-auto-restarts', function(){
        restarts += 1;

        if( restarts > max_restarts ) done( new Error( 'restarted citizen more than permitted amount of times' ) );
      });

      supervisor.hook.add( citizen_name + '-excessive-crash', 'do-assertions', function(){

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

      supervisor.hook.add( 'supervisor-mail', 'do-assertions', function( envelope ){
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

      supervisor.hook.add( name + '-crashed', 'do-assertions', function(){
        supervisor.hook.del( name + '-crashed', 'do-assertions' );

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

      supervisor.hook.add( name + '-shutdown', 'do-assertions', function( msg ){
        supervisor.hook.del( name + '-shutdown', 'do-assertions' );

        assert.equal( citizen.state.current_mail === null, true, 'citizen should not have current mail in its state' );
        assert.equal( citizen.mail.inbox.length === 1, true, 'inbox does not contain expected amount of mail' );
        assert.equal( citizen.mail.inbox[0].msg === message, true, 'content of message on queue does not match sent message' );

        done();
      });

      citizen = supervisor.start( name, './test/citizen/unacked-mail', { retries: 0 });

      citizen.mail.send( message ); 
    });

    it('will cache citizen notices', function( done ){
      this.timeout( 8888 );

      supervisor.start( 'notice-sender', './test/citizen/notice-sender' );

      var cache_checker = setInterval( check_cache_for_citizen_notice, 888 );

      function check_cache_for_citizen_notice(){
        var notice_cache = supervisor.noticeboard.cache[ 'sample-notice-from-citizen' ];

        if( ! notice_cache ) return;
        if( notice_cache !== 'hello supervisor' ) return;

        clearInterval( cache_checker );
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
          citizen,
          paused_at,
          pause_duration_ms;

      supervisor.hook.add( 'supervisor-mail', 'handle-mail', function( envelope ){
        if( ! envelope.msg ) return;

        var content = envelope.msg;

        if( content.pause_for ){
          paused_at = content.paused_at;
          pause_duration_ms = content.pause_for;
        }

        if( content.received === 'do assertions' ){
          var received_at = Date.now(),
              processed = received_at - paused_at;

          assert.equal( processed >= pause_duration_ms, true, 'mail was processed in ' + processed + 'ms but pause duration is ' + pause_duration_ms + 'ms' );          

          // cleanup
            supervisor.hook.add( name + '-stopped', 'end', function(){
              done();
            });

            supervisor.stop( name );
        }
      });

      citizen = supervisor.start( name, './test/citizen/paused-mail', { retries: 0 });

      citizen.mail.send( 'PAUSE' );
      citizen.mail.send( 'do assertions' );
    });

    it('can process mail asynchronously', function( done ){
      this.timeout( 10000 );

      var name = 'async-mail-handler',
          async_mail_handled;

      supervisor.hook.add( 'citizen-signal', 'detect-unhandled-mail', function( envelope ){
        if( typeof async_mail_handled != 'undefined' ) return;

        var citizen_name = envelope.from;
        if( citizen_name != name ) return;
        if( envelope.signal != 'UNHANDLED-MAIL' ) return;

        async_mail_handled = false;

        do_assertions();
      });

      supervisor.hook.add( 'citizen-signal', 'detect-acked-mail', function( envelope ){
        if( typeof async_mail_handled != 'undefined' ) return;

        var citizen_name = envelope.from;
        if( citizen_name != name ) return;
        if( envelope.signal != 'ACK-CURRENT-MAIL' ) return;

        async_mail_handled = true;

        do_assertions();
      });

      var citizen = supervisor.start( name, './test/citizen/async-mail-handler', { retries: 0 });

      citizen.mail.send( 'async mail' );

      function do_assertions(){
        assert.equal( async_mail_handled, true, 'async mail was not handled' );

        supervisor.hook.add( name + '-stopped', 'continue-tests', function(){
          done();
        });

        supervisor.stop( name );
      }
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

      supervisor.hook.add( 'supervisor-mail', 'do-assertions', function( envelope ){
        if( envelope.type !== 'mail' ) return;

        var content = envelope.msg;
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

      supervisor.hook.add( 'supervisor-mail', 'do-assertions', function( envelope ){
        if( envelope.type !== 'mail' ) return;

        var content = envelope.msg;
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

      supervisor.hook.add( 'double-piper-crashed', 'fail-test', function(){
        supervisor.hook.del( 'double-piper-crashed', 'fail-test' );
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
        supervisor.hook.add( 'supervisor-mail', 'assess-cache-access', access_cache_access );

      // cache payload
        supervisor.noticeboard.notify( 'sample-notice', payload_to_cache );

      supervisor.start( 'cache-accesser', './test/citizen/cache-accesser' );

      function access_cache_access( envelope ){
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