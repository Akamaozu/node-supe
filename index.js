var is_citizen_instance = ( process && process.send );

module.exports = is_citizen_instance ? require('./lib/citizen') : require('./lib/supervisor');