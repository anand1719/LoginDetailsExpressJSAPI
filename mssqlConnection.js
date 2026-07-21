const mssql = require('msnodesqlv8');

        
 const mssqlConn = "server=ANAND-HOME;Database=browse_me_one;Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0}";
 const jobSearchConn = "server=ANAND-HOME;Database=JOBSEARCH;Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0}";

module.exports = {
  mssqlConn,
  jobSearchConn
}; 
