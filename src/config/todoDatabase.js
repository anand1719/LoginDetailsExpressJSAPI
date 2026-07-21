const config = require('./env');

/**
 * ToDo database connection string
 * Uses the same MSSQL server but a different database/connection
 */
const todoConn = config.MSSQL_CONN_STRING; // Same connection for now, can be customized

module.exports = {
  todoConn
};