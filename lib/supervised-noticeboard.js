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
        
        break;

        case 'ignore': 

          if( !data.success ) throw new Error( 'attempt to ignore supervisor notices failed' );

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

  watch: function( notice, watcher, callback, opts ){

    if( !callback || typeof callback !== 'function' ) throw new Error( 'callback is required and must be a function' );

    if( noticeboard.watchers[ notice ] && noticeboard.watchers[ notice ].length > 0 ){

      noticeboard.watch( notice, watcher, callback, opts );
    }

    else if( pending[ notice ] ){

      noticeboard.once( notice + '-pipe-installed', 'pipe-to-' + watcher + function(){

        noticeboard.watch( notice, watcher, callback, opts );
      });
    }

    else {

      pending[ notice ] = { 
        
        type: 'watch',
        notice: notice,
        opts: opts,

        callback: function( error ){

          if( error ) throw error;

          noticeboard.watch( notice, watcher, callback, opts );
        }
      };

      signal( 'NOTICEBOARD-REQUEST', pending[ notice ] );
    }
  },

  ignore: function( notice, watcher ){

    noticeboard.ignore( notice, watcher );

    if( noticeboard.watchers[ notice ] && noticeboard.watchers[ notice ].length > 0 ) return;

    signal( 'NOTICEBOARD-REQUEST', { type: 'ignore', notice: notice });
  }
}