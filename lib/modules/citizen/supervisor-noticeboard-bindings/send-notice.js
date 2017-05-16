module.exports = function( citizen, noticeboard, config ){

  citizen.noticeboard.notify = notify_wrapper;

  function notify_wrapper( notice, message, source ){

    citizen.signal( 'NOTICEBOARD-REQUEST', { type: 'notify', notice: notice, message: message, source: source });
  }
}