// var config = {
//     "user":"",
//     "password":"",
//     "server":"ANAND-HOME",
//     "database":"browse_me_one",
//     "options":{
//         "encrypt":false
//     }
// }

const mysql = require('mysql');

//const mssql = require('msnodesqlv8');

const con  = mysql.createConnection({
    host:"localhost",
    port:3306,
    user:"root",
    password:"Anand",
    database:"sample"
    });

// const mssqlConn = "server=ANAND-HOME;Database=browse_me_one;Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0}";
 
module.exports = con; 