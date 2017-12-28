var Noticeboard = require('cjs-noticeboard');

module.exports = function( supervisor, config ){
  
  supervisor.noticeboard = new Noticeboard({ logging: false, logOps: false });
}