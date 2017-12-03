module.exports = function( supervisor ){

  supervisor.noticeboard.watch( 'citizen-signal', 'process-citizen-noticeboard-requests', function( msg ){

    var envelope = msg.notice;
    
    if( !envelope || !envelope.from || !envelope.signal || envelope.signal !== 'NOTICEBOARD-REQUEST' ) return;

    var citizen_name = name = envelope.from,
        citizen = supervisor.get( citizen_name );

    switch( envelope.data.type ){

      case 'watch':

        var notice = envelope.data.notice,
            pipe_notice = 'pipe-to-citizen-' + citizen_name,
            watcher = pipe_notice,
            opts = envelope.data.opts || {};

        opts.message = { notice: notice, name: citizen_name };

        try {

          var pipe_notice_does_not_exist = ! supervisor.noticeboard.watchers[ notice ] || ! supervisor.noticeboard.watchers[ notice ][ watcher ];
          if( pipe_notice_does_not_exist ) {

            // create new pipe
            supervisor.noticeboard.watch( notice, pipe_notice, function( msg ){

              var notice_to_pipe = notice,
                  citizen_is_offline = !citizen.ref;

              if( citizen_is_offline ) {

                supervisor.noticeboard.notify( 'citizen-notice-pipe-failure', {
                  error: 'citizen is currently offline',
                  notice: notice_to_pipe,
                  citizen: citizen_name
                });

                supervisor.noticeboard.notify( citizen_name + '-notice-pipe-failure', {
                  error: 'citizen is currently offline',
                  notice: notice_to_pipe
                });

                return;
              }

              citizen.signal.send( 'NOTICEBOARD-EVENT', { type: 'notice', notice: notice_to_pipe, msg: msg });

            }, opts );
          }

          var shutdown_notice = citizen_name + '-shutdown',
              pipe_disconnector_notice = 'disconnect-' + notice + '-pipes-to-' + citizen_name,
              pipe_disconnects_on_shutdown = supervisor.noticeboard.watchers[ shutdown_notice ] && supervisor.noticeboard.watchers[ shutdown_notice ][ pipe_disconnector_notice ];

          if( ! pipe_disconnects_on_shutdown ) {

            // create pipe disconnector
            supervisor.noticeboard.once( shutdown_notice, pipe_disconnector_notice, function( msg ){

              supervisor.noticeboard.ignore( notice, pipe_notice );
              supervisor.noticeboard.ignore( shutdown_notice, pipe_disconnector_notice );

            }, { message: { name: citizen_name, notice: notice }});
          }

          // if pipe disconnect on crash handler doesn't exist, create it
          var crash_notice = citizen_name + '-crashed',
              pipe_disconnector_notice = 'disconnect-' + notice + '-pipes-to-' + citizen_name,
              pipe_disconnects_on_crash = supervisor.noticeboard.watchers[ crash_notice ] && supervisor.noticeboard.watchers[ crash_notice ][ pipe_disconnector_notice ];

          if( ! pipe_disconnects_on_crash ) {

            var pipe_disconnector_notice = 'disconnect-' + notice + '-pipes-to-' + citizen_name;
            supervisor.noticeboard.once( crash_notice , pipe_disconnector_notice, function( msg ){

              supervisor.noticeboard.ignore( notice, pipe_notice );
              supervisor.noticeboard.ignore( crash_notice, pipe_disconnector_notice );

            }, { message: { name: citizen_name, notice: notice }});
          }

          citizen.signal.send( 'NOTICEBOARD-RESPONSE', { type: 'watch', notice: notice, success: true });
        }

        catch( e ){

          citizen.signal.send( 'NOTICEBOARD-RESPONSE', { type: 'watch', notice: notice, success: false, error: e.toString() });
        }

      break;

      case 'ignore':

        var notice = envelope.data.notice,
            watcher = 'pipe-to-citizen-' + name,
            opts = envelope.data.opts || {};

        opts.message = { notice: notice, name: name };

        try {

          supervisor.noticeboard.ignore( notice, 'pipe-to-citizen-' + name );
          supervisor.noticeboard.ignore( name + '-crashed', 'disconnect-' + notice + '-pipes-to-' + name );
          supervisor.noticeboard.ignore( name + '-shutdown', 'disconnect-' + notice + '-pipes-to-' + name );

          citizen.signal.send( 'NOTICEBOARD-RESPONSE', { type: 'ignore', notice: notice, success: true });

          notice = watcher = name = citizen = opts = null;
        }

        catch( e ){
          citizen.signal.send( 'NOTICEBOARD-RESPONSE', { type: 'ignore', notice: notice, success: false, error: e.toString() });
        }

      break;

      case 'notify':

        var notice = envelope.data.notice,
            message = envelope.data.message,
            source = name + ( envelope.data.source ? '-' + envelope.data.source : '' );

        try {

          supervisor.noticeboard.notify( notice, message, source );

          citizen.signal.send( 'NOTICEBOARD-RESPONSE', { type: 'notify', notice: notice, success: true } );
        }

        catch( e ){
          citizen.signal.send( 'NOTICEBOARD-RESPONSE', { type: 'notify', notice: notice, success: false, error: e.toString() });
        }

      break;
    }
  });
}