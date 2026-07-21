const express = require('express');

const mssql = require('msnodesqlv8')

const mssqlConn = require('./mssqlConnection');

const app = express();
app.use(express.json());

//API Starts
app.get('/getRestoUserList',(req,resp)=>{
    let type='GET_ALLUSER';
    let id='';
    let name ='';
    let email = '';
    let password = '';

 mssql.query(mssqlConn,'exec [dbo].SP_RESTASIGNUP @TYPE=?,@ID=?,@name=?,@e_mail=?,@pass=?',[type,id,name,email,password],(err,result)=>{
    if(err)
    {
        return err;
    }
    else
    {
        resp.send("User list fetched");
    }
 });   
});

app.post('/addSignUp',(req,resp)=>{
    let type = 'ADD_USER';
    let id = '';
    let name = req.body.name;
    let email = req.body.email;
    let password =req.body.password;

    mssql.query(mssqlConn, 'exec SP_RESTASIGNUP @TYPE=?,@ID=?,@name=?,@e_mail=?,@pass=?',[type,id,name,email,password], (err, result) => {
          if (err) {
                throw err;
          }
          else {
                resp.send(result);
                //resp.send('Insert Successfull');
          }
    });

})

app.listen(3500);