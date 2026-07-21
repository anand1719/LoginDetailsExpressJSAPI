const express = require('express');
const moment = require('moment');
const jwt = require('jsonwebtoken');

const secreatKey = "uzVnO6REt4afkn3XGSlbxxI7qAJFzttYhLWY8r1cDCmiccKWFwkubkGa9B5tffjNBqdXVO3ss7BRXwKN";

const app = express();

const con = require('./mysqlConnection');



const createdDate = moment().format('YYYY-MM-DD hh:mm:ss');

con.connect((error) => {
  if (error) {
    console.log(error);
  }
  else {
    console.log("Connection successfull");
  }
});



app.use(express.json());



app.get('/', async (req, res) => {
  await con.query("Select * from test", (err, result) => {
    res.send(result);
  });
  // const str = CircularJSON.stringify(data);
  // res.send(JSON.parse(str));  
});

app.post('/', (req, res) => {
  //const data = req.body;//[req.body.subject,createdDate];// {subject:"Geography",createdDate:createdDate}
const Data = [req.body.subject,req.body.marks,createdDate,createdDate];
 // con.query('INSERT INTO test SET  ? ', data, (error, result, fields) => {
con.query('insert into test (subject,marks,createdDate,updatedDate) values(?,?,?,?)',Data,(error,result,fields)=>{
    if (error) {
      throw error;
    }
    else {
      res.send(result);
    }
  });
});

app.delete('/remove/:id', (req, res) => { 
  const data = req.params.id;
  let id = data;
  con.query('delete from test where id = ?', id, (err, result, fields) => {
    if (err) {
      throw err;
    }
    else {
      res.send(result);
    }
  });
});
 
app.put('/update', (req, res) => {
  const data = [req.body.marks, createdDate, req.body.id];

  con.query('update test set marks=?,updatedDate=? where id=? ', data, (err, result, fields) => {
    if (err) {
      throw err;
    }
    else {
      res.send(result);
    }
  });
});

//JWT Toekenization

app.get('/test', (req, resp) => {
  resp.json({
    message: 'Sample api'
  });
})

app.post('/login', (req, resp) => {
  const userdata = {
    id: 1,
    username: "Anand",
    email: "anand.m@test.com"
  }
  jwt.sign({ userdata }, secreatKey, { expiresIn: '300s' }, (err, token) => {
    if (err) {
      throw err;
    }
    else {
      resp.json({
        token
      });
    }
  });
});

function verifyToken(req,resp,next){
    const bearerHeader = req.headers['authentication'];
    //const bearerHeader = req.authorization['Bearer Token']
    if(typeof bearerHeader !== 'undefined')
    { 
        const bearer = bearerHeader.split(' ');
        const token = bearer[1];
        req.token = token;
        next();
    }
    else
    {
      resp.send({
         message: 'token is not valid'
      });
    }
}

app.post('/profile',verifyToken, (req,resp)=>{
       jwt.verify(req.token,secreatKey,(err,authData)=>{
         if(err)
         {
           resp.send({
             message:'Wrong token'
           })
         }
         else
         {
             resp.json({
               message:"Profile is verified",
               authData
             });
         }
       });
});

app.listen(2500, () => {
  console.log("app is running on port no 2500")
});
// con.query("Select * from test",(err,result) =>{
//   if(err)
//   {
//     console.warn(err);
//   }
//   else
//   {
//     console.log("result",result);
//   }
// })

