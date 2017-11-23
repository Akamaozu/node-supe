module.exports = function( supervisor ){

  supervisor.noticeboard.watch( 'citizen-signal', 'process-citizen-noticeboard-requests', function( msg ){

    var envelope = msg.notice;
    
    if( !envelope || !envelope.from || !envelope.signal || envelope.signal !== 'NOTICEBOARD-REQUEST' ) return;

    var name = envelope.from,
        citizen = supervisor.get( name );

    switch( envelope.data.type ){

      case 'watch':

        var notice = envelope.data.notice,
            watcher = 'pipe-to-citizen-' + name,
            opts = envelope.data.opts || {};

        opts.message = { notice: notice, name: name };

        try {

          // if pipe doesn't exist, create it
          if( ! supervisor.noticeboard.watchers[ notice ] || ! supervisor.noticeboard.watchers[ notice ][ watcher ] ) {

            supervisor.noticeboard.watch( notice, watcher, function( msg ){

              var watcher = msg.watcher,
                  citizen = supervisor.get( watcher.name );

              if( !citizen.ref ) return console.log({
                error: 'could not pipe event to citizen "' + watcher.name + '": citizen is currently offline',
                notice: watcher.notice
              });

              citizen.ref.send({ type: 'signal', signal: 'NOTICEBOARD-EVENT', data: {

                type: 'notice', notice: watcher.notice, msg: msg
              }});

            }, opts );
          }

          // if pipe disconnect on shutdown handler doesn't exist, create it
          if( ! supervisor.noticeboard.watchers[ name + '-shutdown'] || ! supervisor.noticeboard.watchers[ name + '-shutdown'][ 'disconnect-' + notice + '-pipes-to-' + name ] ) {

            supervisor.noticeboard.once( name + '-shutdown' , 'disconnect-' + notice + '-pipes-to-' + name, function( msg ){

              var details = msg.watcher;

              supervisor.noticeboard.ignore( details.notice, 'pipe-to-citizen-' + details.name );
              supervisor.noticeboard.ignore( details.name + '-crashed', 'disconnect-' + details.notice + '-pipes-to-' + details.name );

            }, { message: { name: name, notice: notice }});
          }

          // if pipe disconnect on crash handler doesn't exist, create it
          if( ! supervisor.noticeboard.watchers[ name + '-crashed' ] || ! supervisor.noticeboard.watchers[ name + '-crashed' ][ 'disconnect-' + notice + '-pipes-to-' + name ] ) {

            supervisor.noticeboard.once( name + '-crashed' , 'disconnect-' + notice + '-pipes-to-' + name, function( msg ){

              var details = msg.watcher;

              supervisor.noticeboard.ignore( details.notice, 'pipe-to-citizen-' + details.name );
              supervisor.noticeboard.ignore( details.name + '-shutdown', 'disconnect-' + details.notice + '-pipes-to-' + details.name );

            }, { message: { name: name, notice: notice }});
          }
            
            citizen.ref.send({ 
              type: 'signal', 
              signal: 'NOTICEBOARD-RESPONSE', 
              data: { type: 'watch', notice: notice, success: true } 
            });


          notice = watcher = name = citizen = opts = null;
        }

        catch( e ){

          citizen.ref.send({ 
            type: 'signal', 
            signal: 'NOTICEBOARD-RESPONSE', 
            data: { type: 'watch', notice: notice, success: false, error: e.toString() } 
          });
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

          citizen.ref.send({ 
            type: 'signal', 
            signal: 'NOTICEBOARD-RESPONSE', 
            data: { type: 'ignore', notice: notice, success: true } 
          });

          notice = watcher = name = citizen = opts = null;
        }

        catch( e ){

          citizen.ref.send({ 
            type: 'signal', 
            signal: 'NOTICEBOARD-RESPONSE', 
            data: { type: 'watch', notice: notice, success: false, error: e.toString() } 
          });
        }

      break;

      case 'notify':

        var notice = envelope.data.notice,
            message = envelope.data.message,
            source = name + ( envelope.data.source ? '-' + envelope.data.source : '' );

        try {

          supervisor.noticeboard.notify( notice, message, source );

          citizen.ref.send({
            type: 'signal',
            signal: 'NOTICEBOARD-RESPONSE',
            data: { type: 'notify', notice: notice, success: true }
          });
        }

        catch( e ){ 

          citizen.ref.send({ 
            type: 'signal', 
            signal: 'NOTICEBOARD-RESPONSE', 
            data: { type: 'notify', notice: notice, success: false, error: e.toString() } 
          });
        }

      break;
    }
  });
}