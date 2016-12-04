var assert = require('assert'),
    supe = require('../index');

describe('Supe Test Suite', function(){

  if( !supe.supervised ){

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
            new_process = supervisor.start( 'logger', './citizen/interval-logger' );

        it('returns an object (citizen)', function(){
          assert.equal( Object.prototype.toString.call( new_process ) === '[object Object]', true, 'did not return an object' );
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

            supervisor.start( null, './citizen/interval-logger' );
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

        it('will not create a new citizen with a non-existent file', function(){

          var nonexistent_file_citizen = supervisor.start( 'nonexistent-file-citizen', './citizen/non-existent' );

          assert.equal( !nonexistent_file_citizen, true, 'citizen was created when file param did not point to an existing file' );
        });

        it('will not create a new citizen if name is associated with a different citizen', function(){

          var overwrite_error = false;

          supervisor.start( 'common-citizen', './citizen/one-time-logger' );

          try{

            common_citizen_2 = supervisor.start( 'common-citizen', './citizen/interval-logger' );
          }

          catch( e ){ overwrite_error = true; }

          assert.equal( overwrite_error === true, true, 'new citizen was registered under the name of an existing citizen' );
        });

        it('will restart a previously-started citizen', function( done ){

          var first_start = supervisor.start( 'one-time-logger', './citizen/one-time-logger' );

          setTimeout( function(){

            var second_start = supervisor.start( 'one-time-logger' );

            assert.equal( Object.prototype.toString.call( second_start ) === '[object Object]', true, 'second start attempt did not return an object as expected' );
            assert.equal( second_start.hasOwnProperty( 'ref' ), true, 'second start attempt did not return with a process reference (property "ref")' );
            assert.equal( first_start !== second_start, true, 'first and second start are the same instance' );

            done();

          }, 200 );
        });

        it('will not restart a currently-running citizen', function(){

          var new_logger = supervisor.start( 'logger' );

          assert.equal( Object.prototype.toString.call( new_logger) !== ['object Object'], true, 'restarted currently-running process' );
        });

        it('will pass parameters to citizen\'s config', function(){

          var supervisor = supe(),
              params = { retries: 5, duration: 5, happy: true },
              citizen = supervisor.start( 'custom-logger', './citizen/one-time-logger', params );

          for( var prop in params ){

            if( !params.hasOwnProperty( prop ) ) continue;

            assert.equal( citizen.config.hasOwnProperty( prop ), true, 'citizen config does not have expected property "' + prop + '"' );            
            assert.equal( citizen.config[ prop ] === params[ prop ], true, 'parameter property "' + prop + '" does not match citizen config\'s "' + prop + '"' );            
          }
        });

        it('will override default citizen\'s config', function(){

          var supervisor = supe(),
              default_logger = supervisor.start( 'default-logger', './citizen/one-time-logger' ),
              custom_logger = supervisor.start( 'custom-logger', './citizen/one-time-logger', { retries: 5, duration: 5, happy: true });

          assert.equal( default_logger.config !== custom_logger.config, true, 'config for default and custom loggers are identical' );
        });
      });

      describe('Supervisor.get', function(){

        supervisor = supe();

        it('returns citizen with given name if it exists', function(){

          var citizen = supervisor.start( 'logger', './citizen/interval-logger' ),
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

      var supervisor = supe();

      it('sends a notice when a specific citizen shuts down', function( done ){

        this.timeout( 10000 );
        
        var detected_shutdown = false;

        supervisor.noticeboard.watch( 'one-time-logger-shutdown', 'do-assertions', function( msg ){

          detected_shutdown = true;
          
          assert.equal( detected_shutdown === true, true, 'did not detect specific citizen shutdown' );
          done();
        });

        supervisor.start( 'one-time-logger', './citizen/one-time-logger' );
      });

      it('sends a notice when a specific citizen crashes', function( done ){

        this.timeout( 10000 );

        var detected_crash = false;

        supervisor.noticeboard.once( 'one-time-crasher-crashed', 'do-assertions', function( msg ){

          detected_crash = true;
          assert.equal( detected_crash, true, 'did not detect specific citizen crash' );
          done();
        });

        supervisor.start( 'one-time-crasher', './citizen/one-time-crasher' );
      });

      it('sends a notice when it receives mail from a citizen', function( done ){

        this.timeout( 10000 );

        var received_mail = false;

        supervisor.noticeboard.once( 'supervisor-message', 'do-assertions', function( msg ){

          received_mail = true;

          assert.equal( received_mail === true, true, 'did not detect specific citizen crash' );
          done();
        });

        supervisor.start( 'one-time-mailer', './citizen/one-time-mailer' );
      });
    });

    describe('Citizen (Supervised Process) Coverage Tests', function(){

      var Istanbul = require('cover-child-process').Istanbul,
          ChildProcess = require('cover-child-process').ChildProcess,
          childProcess = new ChildProcess( new Istanbul() );

      childProcess.spawn( 'node', ['./test'] );

      it('must come to an end', function( done ){

        setTimeout( function(){ done() }, 1500 );
      });
    });
  }

  else {

    describe('Citizen (Supervised Process) Properties', function(){

      it('has property "supervised"', function(){

        assert.equal( supe.supervised === true, true, 'is missing property "supervised"' );
      });

      it('has property "mail"', function(){

        assert.equal(Object.prototype.toString.call( supe.mail ) === ['object Object'], true, 'is missing property "mail"' );
      });
    });

    describe('Citizen-Init Tests', function(){

      setInterval( function(){

        supe.mail.send({ type: 'mail', msg: 'start-integration-tests' });
      }, 1000 );
    });
  }
});