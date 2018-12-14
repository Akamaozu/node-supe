module.exports = function( citizen, noticeboard, config ){

  citizen.hook.add( 'supervisor-signal', 'handle-noticeboard-responses', function( envelope ){
    if( ! envelope || ! envelope.signal || envelope.signal !== 'NOTICEBOARD-RESPONSE' ) return;

    var data = envelope.data;
    if( ! data.type ) return console.log({ action: 'handle-noticeboard-responses', success: false, error: 'no noticeboard action type found' });

    switch( data.type ){

      case 'watch':
        if( ! data.success ) citizen.noticeboard.pending[ data.notice ].callback( new Error( data.error || 'unidentified error' ) );
        else citizen.noticeboard.pending[ data.notice ].callback();

        delete citizen.noticeboard.pending[ data.notice ];

        noticeboard.notify( data.notice + '-pipe-installed' );
      break;

      case 'ignore':
        if( ! data.success ) throw new Error( data.error || 'attempt to ignore supervisor notice "' + data.notice + '" failed' );
      break;

      case 'notify':
        if( ! data.success ) throw new Error( data.error || 'attempt to send notice "' + data.notice + '" to supervisor failed' );
      break;
    }
  });

  citizen.hook.add( 'supervisor-signal', 'handle-noticeboard-events', function( envelope ){
    if( ! envelope || ! envelope.signal || envelope.signal !== 'NOTICEBOARD-EVENT' ) return;

    var data = envelope.data;
    if( ! data.type ) return console.log({ action: 'handle-noticeboard-events', success: false, error: 'no noticeboard event type found' });

    switch( data.type ){

      case 'notice':
        if( ! data.notice ) return console.log({ action: 'handle-noticeboard-events', success: false, error: 'event notice name not found' });
        else noticeboard.notify( data.notice, data.msg.notice, 'supe' );
      break;
    }
  });
}