module.exports = function( citizen, noticeboard, config ){

  process.on( 'message', function( envelope ){

    if( !envelope || !envelope.type || envelope.type !== 'signal' ) return;
    if( envelope.signal.indexOf( 'NOTICEBOARD' ) !== 0 ) return;

    switch( envelope.signal ){

      case 'NOTICEBOARD-RESPONSE':

        var data = envelope.data;
        
        if( !data.type ) return;

        switch( data.type ){

          case 'watch':

            if( !data.success ) citizen.noticeboard.pending[ data.notice ].callback( new Error( data.error || 'unidentified error' ) );

            else citizen.noticeboard.pending[ data.notice ].callback();

            delete citizen.noticeboard.pending[ data.notice ];

            noticeboard.notify( data.notice + '-pipe-installed' );
          
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
}