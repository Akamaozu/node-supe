module.exports = function( citizen, noticeboard, config ){

  citizen.noticeboard.ignore = ignore_wrapper;

  function ignore_wrapper( notice, watcher ){

    noticeboard.ignore( notice, watcher );

    if( noticeboard.watchers[ notice ] && noticeboard.watchers[ notice ].length > 0 ) return;

    citizen.signal.send( 'NOTICEBOARD-REQUEST', { type: 'ignore', notice: notice });
  }  
}