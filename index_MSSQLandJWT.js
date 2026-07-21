const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const moment = require('moment');
const jwt = require('jsonwebtoken');


const mssql = require('msnodesqlv8')
const utf8 = require('utf8'); 
const cors = require('cors');

const mssqlConn = require('./mssqlConnection');

const app = express();

const router = express.Router();

const secreatKey = "uzVnO6REt4afkn3XGSlbxxI7qAJFzttYhLWY8r1cDCmiccKWFwkubkGa9B5tffjNBqdXVO3ss7BRXwKN";

app.use(express.json());



const corsOptions = {
      //origin: 'http://localhost:3000/',//(https://your-client-app.com)
      origin: 'http://localhost:4200',//(https://your-client-app.com)
      optionsSuccessStatus: 200,
    };

// app.use(cors(corsOptions));

var allowCrossDomain = function(req, res, next) {
      res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
      // res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
  }
  app.options('http://localhost:3000', cors());

  app.use(allowCrossDomain);

  function convertencrypt(string){
      const key = process.env.ENCRYPTION_KEY;
      const someEncodedString = utf8.encode(string+key);//Buffer.from(string, 'utf-8').toString();
      return  Buffer.from(someEncodedString + key).toString('base64');
      //resp.send(someEncodedString);
}

function convertdecrypt(string){
      const key = process.env.ENCRYPTION_KEY;
      const someEncodedString = Buffer.from(string, 'base64').toString('utf-8');
      let decodedString = utf8.encode(someEncodedString);
      let decode = decodedString.replace(key,"");
      decode= decode.replace(key,"");
      return  decode;
      //resp.send(someEncodedString);
}

app.post('/getUserSignIn',allowCrossDomain,(req,resp)=>{
      let type = 'CHECK_USER';
      let username = req.body.username;
      let password = req.body.password;
      const userdata = {
            username : req.body.username,
            password : req.body.password
      }
       mssql.query(mssqlConn, 'exec SP_USERCHECK @TYPE=?,@USERNAME=?,@PASS=?', [type, username, password], (err, result) => {
            if (err) {
                  throw err;
            }
            else {
                  if(result)
                  {
                        jwt.sign({ userdata }, secreatKey, { expiresIn: '1200s' }, (err, token) => {
                              if (err) {
                                throw err;
                              }
                              else {
                                resp.json({
                                  token
                                });
                              }
                            });
                  }
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

  app.get('/getdata', allowCrossDomain,(req, resp) => {
      const t = 'GET_ALL';
      let type = t;
      let id = '';
      let oname = '';
      let email = '';
      let pass = '';
      let login = '';
      let userid = '';
       mssql.query(mssqlConn, 'exec SP_LOGIN_DETAIL @TYPE=?,@ID=?,@O_NAME=?,@E_MAIL=?,@PASS =?,@LOGIN=?,@userID=?', [type, id, oname, email, pass, login, userid], (err, result) => {
            if (err) {
                  throw err;
            }
            else {
                  // jwt.verify(req.token,secreatKey,(err,authData)=>{
                  //       if(err)
                  //       {
                  //         resp.send({
                  //           message:'Wrong token'
                  //         })
                  //       }
                  //       else
                  //       {
                              resp.send(result);
                              //authData;
                  //       }
                  //     });
            }
      });
});


app.get('/search/:a', allowCrossDomain,verifyToken,(req, resp) => {
      const t = 'GET_ANY';
      let type = t;
      let id = '';
      let oname = req.params.a;
      let email = '';
      let pass = '';
      let login = '';
      let userid = '';
       mssql.query(mssqlConn, 'exec SP_LOGIN_DETAIL @TYPE=?,@ID=?,@O_NAME=?,@E_MAIL=?,@PASS =?,@LOGIN=?,@userID=?', [type, id, oname, email, pass, login, userid], (err, result) => {
            if (err) {
                  throw err;
            }
            else {
                  jwt.verify(req.token,secreatKey,(err,authData)=>{
                        if(err)
                        {
                          resp.send({
                            message:'Wrong token' 
                          })
                        }
                        else
                        {
                              resp.send(result);
                              authData;
                        }
                      });
            }
      });
});


//Edit Api with post
app.post('/GetDataById', allowCrossDomain,verifyToken,(req, res) => {
      // mssql.query(mssqlConn,'exec SP_LOGIN_DETAIL_ALL @TYPE',['GET_ALL'], (err, result) => {
      const data = req.body.Id;
      let type = 'GET_LOGIN';
      let id = data;
      let oname = '';
      let email = '';
      let pass = '';
      let login = '';
      let userid = '';
      mssql.query(mssqlConn, 'exec SP_LOGIN_DETAIL @TYPE=?,@ID=?,@O_NAME=?,@E_MAIL=?,@PASS =?,@LOGIN=?,@userID=?', [type, id, oname, email, pass, login, userid], (err, result) => {
            if (err) {
                  throw err;
            }
            else {
                // res.pass = convertdecrypt(res.pass);
                  //const pass = convertdecrypt(result.get("password").asText());
                  //let json = JSON.parse(result);
                  //let pass = json.result.password;
                  //pass = convertdecrypt(pass);\
                  jwt.verify(req.token,secreatKey,(err,authData)=>{
                        if(err)
                        {
                          res.send({
                            message:'Wrong token'
                          })
                        }
                        else{
                              var val = result.find(function(e) {
                                    return e.id == id;
                                  });
                              val.password  = convertdecrypt(val.password);
                              res.send(val);            
                        }
                  })
            } 
      });
})

    

app.post('/decrypt',allowCrossDomain,(req,resp)=>{
      const data = req.body.password;
      let val = convertdecrypt(data);
      const a = {password:val}
      resp.send(a);
})


app.post('/insert', allowCrossDomain, verifyToken,(req, resp) => {
      let type = 'ADD_LOGIN';
      let id = '';
      let oname = req.body.org_name;
      let email = req.body.email;
      let pass = convertencrypt(req.body.password);
      let login = req.body.login_type;
      let userid = req.body.userId;

      mssql.query(mssqlConn, 'exec SP_LOGIN_DETAIL @TYPE=?,@ID=?,@O_NAME=?,@E_MAIL=?,@PASS =?,@LOGIN=?,@userID=?', [type, id, oname, email, pass, login, userid], (err, result) => {
            if (err) {
                  throw err;
            }
            else {
                  resp.send(result);
                  //resp.send('Insert Successfull');
            }
      });
});


app.post('/update', allowCrossDomain, verifyToken, (req, resp) => {
      let type = 'EDIT_LOGIN';
      let id = req.body.Id;
      let oname = req.body.org_name;
      let email = req.body.email;
      let pass = convertencrypt(req.body.password);
      let login = req.body.login_type; 
      let userid = req.body.userId;

      mssql.query(mssqlConn, 'exec SP_LOGIN_DETAIL @TYPE=?,@ID=?,@O_NAME=?,@E_MAIL=?,@PASS =?,@LOGIN=?,@userID=?', [type, id, oname, email, pass, login, userid], (err, result) => {
            if (err) {
                  throw err;
            }
            else {
                  resp.send('Update Successfull');
            }
      });
});


app.post('/delete', allowCrossDomain,verifyToken,(req, resp) => {
      let type = 'DELETE';
      let id = req.body.Id;
      let oname = '';
      let email = '';
      let pass = '';
      let login = '';
      let userid = '';

      mssql.query(mssqlConn, 'exec SP_LOGIN_DETAIL @TYPE=?,@ID=?,@O_NAME=?,@E_MAIL=?,@PASS =?,@LOGIN=?,@userID=?', [type, id, oname, email, pass, login, userid], (err, result) => {
            if (err) {
                  throw err;
            }
            else {
                  resp.send('Deleted Successfull');
            }
      });
});


//GetBy Id api using inline query
app.get('/getbyid/:id', (req, res) => {
      //await pool.mssqlConn();
      //const result = await pool.request().input().execute(`SP_LOGIN_DETAIL_ALL @TYPE=GET_ALL`);
      // const emp = result.recordset;
      // res.json(emp);
      const data = req.params.id;
      let id = data;
      mssql.query(mssqlConn, 'select * from Login_Detail where id=?', [id], (err, result) => {
            if (err) {
                  throw err;
            }
            else {
                  res.send(result);
            }
      })
});

app.get('/', (req, resp) => {
      // const query = 'select * from Login_Detail';
      // mssqlConn.query(query,(err,result)=>{
      //     resp.send(result);
      // })
      mssql.query(mssqlConn, 'select * from Login_Detail order by id desc', (err, result) => {
            resp.send(result);
      });
});



app.get('/encrypt/:input',(req,resp)=>{
      const a = req.params.input;
      resp.send(Buffer.from(a).toString('base64'));
            // const a = req.params.input;
            // resp.send(conevrtencrypt(a));
});

app.listen(4001);