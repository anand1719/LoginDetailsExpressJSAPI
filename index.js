const express = require('express');

//const sqlConnect = require('./mssql');
 const sql = require('msnodesqlv8');
 const app = express();

//const sql = express.sql();

// var config = {
//     "user": "",
//     "password": "",
//     "server": "ANAND-HOME",
//     "database": "browse_me_one",
//     "options": {
//         "encrypt": false
//     }
// }

// var config = {
//     user: '...',
//     password: '...',
//     server: 'ANAND-HOME',
//     driver: 'msnodesql',
//     database: 'browse_me_one',
//     connectionString: "Host=localhost;Server=ANAND-HOME:1433;Database=browse_me_one;"
// };

const config = "server=ANAND-HOME;Database=browse_me_one;Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0}";
let conn;
sql.open(config, (err, connection) => {
    if (err) {
        throw err;
    }
    conn = connection;
    console.log("Sql connection is successfull");
});


app.get('/', (req, res) => {
    conn.query("Select * from Login_Detail", (err, rows) => {
        if (err) {
            console.error("Exception in query", err);
        }
        else {
            res.send(rows);
            console.dir(rows);
        }
    });
});

app.listen(2000);

