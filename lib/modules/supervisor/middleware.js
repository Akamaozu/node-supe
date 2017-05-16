module.exports = function( supervisor, config ){
  
  supervisor.middleware = require('../../../utils/middleware')();
}