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
        expected_properties = [ 'start', 'get', 'noticeboard' ];

    it('has its own "start" function', function(){   

      assert.equal( supervisor.hasOwnProperty('start') && typeof supervisor.start === 'function', true, 'didn\'t instantiate with its own "start" function');
    });

    it('has its own "get" function', function(){   

      assert.equal( supervisor.hasOwnProperty('get') && typeof supervisor.start === 'function', true, 'didn\'t instantiate with its own "get" function');
    });

    it('has its own "noticeboard" object', function(){   

      assert.equal( supervisor.hasOwnProperty('noticeboard') && Object.prototype.toString.call( supervisor.noticeboard ) === '[object Object]', true, 'didn\'t instantiate with its own "noticeboard" object');
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

    describe('Supervisor.start', function(){
      
      var supervisor = supe(),
          new_process = supervisor.start( 'logger', './test/citizen/interval-logger' );

      it('returns an object (citizen)', function( done ){

        assert.equal( Object.prototype.toString.call( new_process ) === '[object Object]', true, 'did not return an object' );
        setTimeout( done, 0 );
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

      it('will not create a new citizen without name parameter', function(){

        var crashed = false;

        try{

          supervisor.start( null, './test/citizen/interval-logger' );
        }

        catch( e ){ crashed = true; }

        assert.equal( crashed === true , true, 'citizen was created without name parameter' );
      });

      it('will not create a new citizen without file parameter', function(){

        var fileless_citizen = supervisor.start( 'fileless-citizen' );

        assert.equal( !fileless_citizen, true, 'citizen was created without file parameter' );
      });

      it('will not create a new citizen if file parameter is not a string', function(){

        var nonstrings = [ 1, [], {}, function(){} ],
            nonstring_file_citizen;

        nonstrings.forEach( function( nonstring ){

          nonstring_file_citizen = supervisor.start( 'nonstring-file-citizen' );
          assert.equal( !nonstring_file_citizen, true, 'citizen was created with a non-string file parameter' );
        });
      });

      it('will not create a new citizen if name is associated with a different citizen', function(){

        var overwrite_error = false;

        supervisor.start( 'common-citizen', './test/citizen/one-time-logger' );

        try{

          common_citizen_2 = supervisor.start( 'common-citizen', './test/citizen/interval-logger' );
        }

        catch( e ){ overwrite_error = true; }

        assert.equal( overwrite_error === true, true, 'new citizen was registered under the name of an existing citizen' );
      });

      it('will restart a previously-started citizen', function( done ){

        this.timeout( 12000 );

        var first_start = supervisor.start( 'one-time-logger', './test/citizen/one-time-logger' ),
            first_pid = first_start.ref.pid;

        setTimeout( function(){

          var second_start = supervisor.start( 'one-time-logger' ),
              second_pid = second_start.ref.pid;

          assert.equal( Object.prototype.toString.call( second_start ) === '[object Object]', true, 'second start attempt did not return an object as expected' );
          assert.equal( second_start.hasOwnProperty( 'ref' ), true, 'second start attempt did not return with a process reference (property "ref")' );
          assert.equal( first_pid !== second_pid || first_start.ref !== second_start.ref, true, 'first and second start are the same instance' );

          done();

        }, 8000 );
      });

      it('will not restart a currently-running citizen', function(){

        var new_logger = supervisor.start( 'logger' );

        assert.equal( Object.prototype.toString.call( new_logger) !== ['object Object'], true, 'restarted currently-running process' );
      });

      it('will pass parameters to citizen\'s config', function(){

        var supervisor = supe(),
            params = { retries: 5, duration: 5, happy: true },
            citizen = supervisor.start( 'custom-logger', './test/citizen/one-time-logger', params );

        for( var prop in params ){

          if( !params.hasOwnProperty( prop ) ) continue;

          assert.equal( citizen.config.hasOwnProperty( prop ), true, 'citizen config does not have expected property "' + prop + '"' );            
          assert.equal( citizen.config[ prop ] === params[ prop ], true, 'parameter property "' + prop + '" does not match citizen config\'s "' + prop + '"' );            
        }
      });

      it('will override default citizen\'s config', function(){

        var supervisor = supe(),
            default_logger = supervisor.start( 'default-logger', './test/citizen/one-time-logger' ),
            custom_logger = supervisor.start( 'custom-logger', './test/citizen/one-time-logger', { retries: 5, duration: 5, happy: true });

        assert.equal( default_logger.config !== custom_logger.config, true, 'config for default and custom loggers are identical' );
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
  });

  describe('Supervisor Noticeboard Integration', function(){

    var supervisor;
    
    beforeEach( function(){
      supervisor = supe({ retries: 0 });
    });

    it('sends a citizen-specific notice when it shuts down', function( done ){

      this.timeout( 15000 );
      
      var detected_shutdown = false;

      supervisor.noticeboard.watch( 'one-time-logger-shutdown', 'do-assertions', function( msg ){

        detected_shutdown = true;
        
        assert.equal( detected_shutdown === true, true, 'did not detect specific citizen shutdown' );
        done();
      });

      supervisor.start( 'one-time-logger', './test/citizen/one-time-logger' );
    });

    it('sends a general notice when any citizen shuts down', function( done ){

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

    it('sends a citizen-specific notice on crash', function( done ){

      this.timeout( 10000 );

      var detected_crash = false;

      supervisor.noticeboard.once( 'one-time-crasher-crashed', 'do-assertions', function( msg ){

        detected_crash = true;
        assert.equal( detected_crash, true, 'did not detect specific citizen crash' );
        done();
      });

      supervisor.start( 'one-time-crasher', './test/citizen/one-time-crasher', { retries: 0 } );
    });

    it('sends a general notice when any citizen crashes', function( done ){

      this.timeout( 15000 );
      
      var first_citizen_name = 'first-crasher',
          second_citizen_name = 'second-crasher',
          crashes_detected = 0;

      supervisor.noticeboard.watch( 'citizen-crashed', 'do-assertions', function( msg ){

        crashes_detected += 1;

        var details = msg.notice;

        if( details.name !== second_citizen_name ) return;
        
        assert.equal( crashes_detected === 2, true, 'did not detect all citizen crashes' );
        assert.equal( details.name === second_citizen_name, true, 'did not detect expected citizen crash' );
        
        done();
      });

      supervisor.start( first_citizen_name, './test/citizen/one-time-crasher' );

      setTimeout( function(){
        supervisor.start( second_citizen_name, './test/citizen/one-time-crasher' );
      }, 2000 );
    });

    it('sends a citizen-specific notice when crashed ctitzen is restarted', function( done ){

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

    it('sends a general notice when any crashed citizen is restarted', function( done ){

      this.timeout( 15000 );
      
      var first_citizen_name = 'first-crasher',
          second_citizen_name = 'second-crasher',
          crashes_detected = 0;

      supervisor.noticeboard.watch( 'citizen-auto-restarted', 'do-assertions', function( msg ){

        crashes_detected += 1;

        var details = msg.notice;

        if( details.name !== second_citizen_name ) return;
        
        assert.equal( crashes_detected === 2, true, 'did not detect all citizen restarts' );
        assert.equal( details.name === second_citizen_name, true, 'did not detect expected citizen crash' );
        
        done();
      });

      supervisor.start( first_citizen_name, './test/citizen/one-time-crasher', { retries: 1 });

      setTimeout( function(){
        supervisor.start( second_citizen_name, './test/citizen/one-time-crasher', { retries: 1 });
      }, 1000 );
    });

    it('sends a notice when it receives mail from a citizen', function( done ){

      this.timeout( 10000 );

      var received_mail = false;

      supervisor.noticeboard.watch( 'supervisor-message', 'do-assertions', function( msg ){

        if( msg.notice.type !== 'mail' ) return;

        received_mail = true;

        assert.equal( received_mail === true, true, 'did not detect specific citizen crash' );
        done();
      });

      var mailer = supervisor.start( 'one-time-mailer', './test/citizen/one-time-mailer' );

      mailer.mail.send( 'ohayo gozaimasu' );
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
  });
});