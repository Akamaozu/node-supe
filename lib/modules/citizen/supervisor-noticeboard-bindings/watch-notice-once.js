module.exports = function( citizen, noticeboard, config ){
  
  citizen.noticeboard.once = once_wrapper;

  function once_wrapper( notice, watcher, callback, opts ){

    if( !opts ) opts = {};

    opts.once = true; 

    return citizen.noticeboard.watch( notice, watcher, callback, opts );
  }
}