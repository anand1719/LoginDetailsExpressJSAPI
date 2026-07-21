const mssql = require('msnodesqlv8');
const config = require('./env');

/**
 * Database connection strings for different MSSQL databases
 */
const mssqlConn = config.MSSQL_CONN_STRING;
const jobSearchConn = config.JOBSEARCH_CONN_STRING;

module.exports = {
  mssqlConn,
  jobSearchConn,
  mssql, // Export the driver so services can use it
};