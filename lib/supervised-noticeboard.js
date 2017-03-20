var signal = require('./supervised-send-signal'),
    pending = {},
    Noticeboard = require('cjs-noticeboard'),
    noticeboard = new Noticeboard({ logOps: false, logging: false });

process.on( 'message', function( envelope ){

  if( !envelope || !envelope.type || envelope.type !== 'signal' ) return;
  if( envelope.signal.indexOf( 'NOTICEBOARD' ) !== 0 ) return;

  switch( envelope.signal ){

    case 'NOTICEBOARD-RESPONSE':

      var data = envelope.data;
      
      if( !data.type ) return;

      switch( data.type ){

        case 'watch':

          if( !data.success ) pending[ data.notice ].callback( new Error( data.error || 'unidentified error' ) );

          else pending[ data.notice ].callback();

          delete pending[ data.notice ];

          noticeboard.notify( notice + '-pipe-installed' );
        
        break;

        case 'ignore': 

          if( !data.success ) throw new Error( data.error || 'attempt to ignore supervisor notice "' + data.notice + '" failed' );

        break;

        case 'notify': 

          if( !data.success ) throw new Error( data.error || 'attempt to send notice "' + data.notice + '" to supervisor failed' );

        break;
      }

    break;

    case 'NOTICEBOARD-EVENT':

      var data = envelope.data;

      if( !data.type ) return;

      switch( data.type ){

        case 'notice':

          if( !data.notice ) return;

          noticeboard.notify( data.notice, data.msg.notice, 'supe' );

        break;
      }

    break;
  }
});

module.exports = {

  watch: watch_wrapper,

  once: once_wrapper,

  ignore: ignore_wrapper,

  notify: notify_wrapper
};

function watch_wrapper( notice, watcher, callback, opts ){

  var method = opts && opts.once ? 'once' : 'watch';

  if( method === 'once' ){

    callback = function( real_callback ){

      return function( msg ){

        real_callback( msg );
        ignore_wrapper( notice, watcher );
      }
    }( callback );
  }

  if( noticeboard.watchers[ notice ] && noticeboard.watchers[ notice ].length > 0 ){

    noticeboard[ method ]( notice, watcher, callback, opts );
  }

  else if( pending[ notice ] ){

    noticeboard.once( notice + '-pipe-installed', 'pipe-to-' + watcher + function(){

      noticeboard[ method ]( notice, watcher, callback, opts );
    });
  }

  else {

    pending[ notice ] = { 
      
      type: 'watch',
      notice: notice,
      opts: opts,

      callback: function( error ){

        if( error ) throw error;

        noticeboard[ method ]( notice, watcher, callback, opts );
      }
    };

    signal( 'NOTICEBOARD-REQUEST', pending[ notice ] );
  }
}

function once_wrapper( notice, watcher, callback, opts ){

  if( !opts ) opts = {};

  opts.once = true; 

  return watch_wrapper( notice, watcher, callback, opts );
}

function ignore_wrapper( notice, watcher ){

  noticeboard.ignore( notice, watcher );

  if( noticeboard.watchers[ notice ] && noticeboard.watchers[ notice ].length > 0 ) return;

  signal( 'NOTICEBOARD-REQUEST', { type: 'ignore', notice: notice });
}

function notify_wrapper( notice, message, source ){

  signal( 'NOTICEBOARD-REQUEST', { type: 'notify', notice: notice, message: message, source: source });
}