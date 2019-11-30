module.exports = function( citizen, noticeboard, config ){

  citizen.noticeboard.watch = watch_wrapper;

  function watch_wrapper( notice, watcher, callback, opts ){

    var method = opts && opts.once ? 'once' : 'watch';

    if( method === 'once' ){
      callback = function( real_callback ){

        return function( msg ){
          real_callback( msg );
          citizen.noticeboard.ignore( notice, watcher );
        }
      }( callback );
    }

    // if there is an active watcher, pipe is still installed
    // -- do a normal watch
      var has_watchers = false;
      if( noticeboard.watchers[ notice ] ){

        for( var i in noticeboard.watchers[ notice ] ){
          if( ! noticeboard.watchers[ notice ].hasOwnProperty( i ) ) continue;

          has_watchers = true;
          break;
        }
      }

      if( has_watchers ){
        noticeboard[ method ]( notice, watcher, callback, opts );
      }

    // no active watcher but one has already requested pipe installation
    // -- wait for pipe to be installed then watch normally
      else if( citizen.noticeboard.pending[ notice ] ){

        noticeboard.once( notice + '-pipe-installed', 'pipe-to-' + watcher, function(){
          noticeboard[ method ]( notice, watcher, callback, opts );
        });
      }

    // no active watcher and no pipe request
    // -- request pipe, watch normally after installation
      else {

        citizen.noticeboard.pending[ notice ] = {
          type: 'watch',
          notice: notice,
          opts: opts,

          callback: function( error ){
            if( error ) throw error;
            else noticeboard[ method ]( notice, watcher, callback, opts );
          }
        };

        citizen.signal.send( 'NOTICEBOARD-REQUEST', citizen.noticeboard.pending[ notice ] );
      }
  }
}