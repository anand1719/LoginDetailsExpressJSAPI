const mysql = require('mysql');

//const  naukriConnct = "server=ANAND-HOME; Database=employer; Trusted_Connection=Yes; Driver ={SQL Server Native Client=11.0}";

var mysqlconn = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "[Anand$$17691]"
  });
module.exports = mysqlconn;