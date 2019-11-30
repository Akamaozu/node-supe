module.exports = function( citizen, noticeboard, config ){

  citizen.noticeboard.ignore = ignore_wrapper;

  function ignore_wrapper( notice, watcher ){
    noticeboard.ignore( notice, watcher );

    var has_watchers = false;
    if( noticeboard.watchers[ notice ] ){

      for( var i in noticeboard.watchers[ notice ] ){
        if( ! noticeboard.watchers[ notice ].hasOwnProperty( i ) ) continue;

        has_watchers = true;
        break;
      }
    }

    if( ! has_watchers ) citizen.signal.send( 'NOTICEBOARD-REQUEST', { type: 'ignore', notice: notice });
  }
}