//import * as logger from "./AppInsights/custom.logger";
//import requestLogger from "./Middleware/request-logger.ts";

//import  * as logCheckpoint from "./AppInsights/logger.ts";
//import express from 'express';
//import moment from 'moment';
//import jwt from 'jsonwebtoken';
const dotenv = require('dotenv');
dotenv.config();  // Load environment variables FIRST

const { getFromCache, setToCache, deleteByPattern } = require('./redisClient');

const Groq = require("groq-sdk");
//const openai = require("openai");
// const { setupAppInsights } = require('./AppInsights/appinsight.js');
// setupAppInsights();  // Initialize AFTER env vars are loaded

//const { logCheckpoint } = require('./AppInsights/logger.js');
//const requestLogger = require("./Middleware/request-logger.js");
const express = require('express'); 
const moment = require('moment');
const jwt = require('jsonwebtoken');
//import mssql from 'msnodesqlv8';
const mssql = require('msnodesqlv8')
const utf8 = require('utf8');
//import utf8 from 'utf8';
const cors = require('cors');
//import cors from 'cors';
const { mssqlConn, jobSearchConn } = require('./mssqlConnection');
//import { mssqlConn } from "./mssqlConnection.js";
const app = express();
const router = express.Router();
const secreatKey = "uzVnO6REt4afkn3XGSlbxxI7qAJFzttYhLWY8r1cDCmiccKWFwkubkGa9B5tffjNBqdXVO3ss7BRXwKN";
const todoConn = require('./todo_mssqlConnect');
//import todoConn from './todo_mssqlConnect.js';
const nodemailer = require('nodemailer');
//import nodemailer from 'nodemailer';
const bodyParser = require('body-parser');
//import bodyParser from "body-parser";
const OpenAI = require('openai');
//import { OpenAI } from "openai";
//import dotenv from "dotenv" 
//const mssql = require('mssql');
// const sqlConfig
const axios = require('axios');
//import axios from 'axios';
//import { fileURLToPath } from "url";
//import path from "path";
//const getCorrelationId = require('./AppInsights/correlation-id-service');

app.use(express.json());

//console.log("requestLogger:", requestLogger);
//app.use(requestLogger); // ✅ FIXED

// const corsOptions = {
//       //origin: 'http://localhost:3000/',//(https://your-client-app.com)
//       // origin: 'http://localhost:4200',//(https://your-client-app.com)
//       origin: 'http://localhost:8081',//(https://your-client-app.com)
//       optionsSuccessStatus: 200,
//     };

const allowedOrigins = [
      'http://localhost:3001',
      'http://localhost:3000'
]

app.use(cors({
      origin: allowedOrigins// Allow frontend to access this API
}));

// app.use(cors(corsOptions));

var allowCrossDomain = function (req, res, next) {
      const origin = req.headers.origin
      if (allowedOrigins.includes(origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Content-Type', 'application/xml');
      }
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      res.header('Access-Control-Allow-Credentials', 'true')
      next();
}
//app.options('http://localhost:3000', cors()); 

//app.use(allowCrossDomain); 
// app.use(allowCrossDomain, function (req, res, next) {
//       res.setHeader('Content-Type', 'application/xml');
//       next();
// })

function convertencrypt(string) {
      const key = process.env.ENCRYPTION_KEY
      //const someEncodedString = utf8.encode(string+key);//Buffer.from(string, 'utf-8').toString();
      return Buffer.from(string + key).toString('base64');
      //resp.send(someEncodedString);
}

function convertdecrypt(string) {
      const key = process.env.ENCRYPTION_KEY;
      //const someEncodedString = Buffer.from(string, 'base64').toString('utf-8');
      const decoded = Buffer.from(string, 'base64').toString('utf-8');
      if (decoded.endsWith(key)) {
            return decoded.slice(0, -key.length);
      }
      return decoded;
      //resp.send(someEncodedString);
}

app.use(bodyParser.json());
const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// const client = new OpenAI({
//       apiKey: process.env.OPENROUTER_API_KEY,
//       baseURL: "https://openrouter.ai/api/v1",
// });


// app.post('/getUserSignIn', (req, resp) => {
//       let type = 'CHECK_USER';
//       // let username = req.body.username;
//       // let password = req.body.password;
//       const userdata = {
//             username: req.body.username,
//             password: req.body.password
//       }
//       //console.log("Request Body", userdata);
//       mssql.query(mssqlConn, 'exec SP_USERCHECK @TYPE=?,@USERNAME=?,@PASS=?,@USEREMAIL=?', [type, userdata.username, userdata.password, ''], (err, result) => {
//             if (err) {
//                   //throw err;
//                   return resp.status(500).json({ message: 'Internal server error' });
//             }
//             if (!result.recordset || result.recordset.length === 0) {
//                   return resp.status(401).send('Wrong credentials');
//             }
//             else {
//                   console.log(result);
//                   //resp.send(result); 
//                   //console.log("Query Result", result);
//                   const user = result.recordset[0];
//                   jwt.sign({ userdata }, secreatKey, { expiresIn: '3600s' }, (err, token) => {
//                         if (err) {
//                               resp.status(500).json({ message: 'Error generating token' });
//                         }
//                         else { 
//                               resp.json({
//                                     userdetails:
//                                     {
//                                           username: user.username,
//                                           user_type: user.user_type,
//                                           user_email: user.user_email
//                                     }, token: token
//                               });
//                         }
//                   });
//                   //resp.send(result);
//             }
//       });
// });

app.post('/getUserSignIn', (req, resp) => {
      //logger.logInfo("User SignIn attempt", { username: req.body.username });

  //const correlationId = getCorrelationId.generateNew();
  //logCheckpoint('Started execution of User SIGNIN', { username: req.body.username, correlationId: correlationId });

  const type = 'CHECK_USER';

  const userdata = {
    username: req.body.username,
    password: req.body.password
  };

  mssql.query(
    mssqlConn,
    'exec SP_USERCHECK @TYPE=?,@USERNAME=?,@PASS=?,@USEREMAIL=?',
    [type, userdata.username, userdata.password, ''],
    (err, result) => {

      if (err) {
        console.error(err);
        return resp.status(500).json({ error: "Database error" });
      }

      const user = result[0];

      if (!user || user.length === 0) {
        return resp.status(401).send('Wrong credentials');
      }

      const payload = { username: user.username, user_type: user.user_type, user_email: user.user_email };
      //logCheckpoint('User authenticated successfully', { username: user.username, correlationId: correlationId });
      jwt.sign(payload, secreatKey, { expiresIn: '3600s' }, (err, token) => {
        if (err) {
            //logger.logError("Token generation failed", { error: err });
            //logCheckpoint('Token generation failed', { username: user.username, error: err, correlationId: correlationId });
          return resp.status(500).json({ error: "Token generation failed" });
        }
        //logCheckpoint('Completed execution of User SIGNIN', { username: user.username, correlationId: correlationId });
        resp.json({
      //     userDetails: {
      //       username: user.username,
      //       user_type: user.user_type,
      //       user_email: user.user_email
      //     },
          token: token
        });
      });
    }
  );
});


function verifyToken(req, res, next) {
      const bearerHeader = req.headers['authorization'];
      //const bearerHeader = req.authorization['Bearer Token']
      if (typeof bearerHeader !== 'undefined') {
            const bearer = bearerHeader.split(' ');
            const token = bearer[1];
            jwt.verify(token, secreatKey, (err, authData) => {
                  if (err) {
                        return res.status(403).json({
                              message: 'Token is not valid'
                        });
                  } else {
                        //console.log(authData);
                        req.authData = authData;
                        next();
                  }
            });
      }
      else {
            return res.status(403).json({ message: 'No token provided' });
      }
}

app.post('/chat', verifyToken, async (req, res) => {
  const { message } = req.body;

  try {
       // Search the web using Tavily
        const searchResponse = await axios.post(
            "https://api.tavily.com/search",
            {
                api_key: process.env.TAVILY_API_KEY,
                query: message,
                search_depth: "basic",
                include_answer: true,
                max_results: 5
            }
        );

        const searchResults = searchResponse.data.results
            .map((item, index) =>
                `${index + 1}. ${item.title}
      ${item.content}
      Source: ${item.url}`
            )
            .join("\n\n");

        const prompt = `
      User Question:
      ${message}

      Latest Search Results:
      ${searchResults}

      Using only the latest search results above, answer the user's question.
      If multiple news articles exist, summarize them in bullet points.
      Mention the source URLs when appropriate.
      `;
 
      const response = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant', // ✅ changed
      messages: [
        { role: 'user', content: message }
      ],
    });

    res.json({
      reply: response.choices[0].message.content
    });

  } catch (error) {
    console.error('Error communicating with Groq:', error);
    res.status(500).json({
      error: 'Error communicating with Groq'
    });
  }
});

// app.post("/chat", verifyToken, async (req, res) => {
//   const { message } = req.body;

//   try {
//     const response = await client.chat.completions.create({
//       model: "deepseek/deepseek-v4-flash",
//       messages: [
//         {
//           role: "user",
//           content: message,
//         },
//       ],
//     });

//     res.json({
//       reply: response.choices[0].message.content,
//     });
//   } catch (error) {
//     console.error("OpenRouter Error:", error);

//     res.status(500).json({
//       error: "Error communicating with OpenRouter",
//     });
//   }
// });

app.get('/getdata', allowCrossDomain, async (req, resp) => {
      const cacheKey = 'getdata:all';
      
      // Try cache first
      const cachedData = await getFromCache(cacheKey);
      if (cachedData) {
            resp.setHeader('Content-Type', 'application/xml');
            return resp.send(cachedData);
      }

      const t = 'GET_ALL';
      let type = t;
      let id = '';
      let oname = '';
      let email = '';
      let pass = '';
      let login = '';
      let userid = '';
      let login_notes = ''; // Optional field, default to empty string
      let username = req.query.username || ''; // Optional field, default to empty string
      resp.setHeader('Content-Type', 'application/xml');
      mssql.query(mssqlConn, 'exec SP_LOGIN_DETAIL @TYPE=?,@ID=?,@O_NAME=?,@E_MAIL=?,@PASS =?,@LOGIN=?,@userID=?,@login_notes=?,@username=?', [type, id, oname, email, pass, login, userid, login_notes, username], (err, result) => {
            if (err) {
                  throw err;
            }
            else {
                  setToCache(cacheKey, result, 600); // Cache for 10 minutes
                  resp.send(result);
            }
      });
});


app.post('/search', allowCrossDomain, verifyToken, async (req, resp) => {
      const data = req.body.search;
      const cacheKey = `search:${data}`;
      
      // Try cache first
      const cachedData = await getFromCache(cacheKey);
      if (cachedData) {
            return resp.send(cachedData);
      }

      const t = 'GET_ANY';
      let type = t;
      let id = '';
      let oname = data;
      let email = '';
      let pass = '';
      let login = '';
      let userid = '';
      let login_notes = ''; // Optional field, default to empty string
      let username = req.body.username || ''; // Optional field, default to empty string
      mssql.query(mssqlConn, 'exec SP_LOGIN_DETAIL @TYPE=?,@ID=?,@O_NAME=?,@E_MAIL=?,@PASS =?,@LOGIN=?,@userID=?,@login_notes=?,@username=?', [type, id, oname, email, pass, login, userid, login_notes, username], (err, result) => {
            if (err) {
                  throw err;
            }
            else {
                  setToCache(cacheKey, result, 600); // Cache for 10 minutes
                  resp.send(result);
            }
      });
});


//Edit Api with post
app.post('/getDataById', allowCrossDomain, async (req, res) => {
      const data = req.body.Id;
      const cacheKey = `getDataById:${data}`;
      
      // Try cache first
      const cachedData = await getFromCache(cacheKey);
      if (cachedData) {
            return res.send(cachedData);
      }

      let type = 'GET_LOGIN';
      let id = data;
      let oname = '';
      let email = '';
      let pass = '';
      let login = '';
      let userid = '';
      let login_notes = '';
      let username = req.body.username || ''; // Optional field, default to empty string
      mssql.query(mssqlConn, 'exec SP_LOGIN_DETAIL @TYPE=?,@ID=?,@O_NAME=?,@E_MAIL=?,@PASS =?,@LOGIN=?,@userID=?,@login_notes=?,@username=?', [type, id, oname, email, pass, login, userid, login_notes, username], (err, result) => {
            if (err) {
                  throw err;
            }
            else {
                  let val = result.find(function (e) {
                        return e.id == id;
                  });
                  if (val) {
                        val.password = convertdecrypt(val.password);
                        const responseData = [val];
                        setToCache(cacheKey, responseData, 600); // Cache for 10 minutes
                        res.send(responseData);
                  } else {
                        res.send([]);
                  }
            }
      });
})

app.post('/decrypt', allowCrossDomain, (req, resp) => {
      const data = req.body.password;
      let val = convertdecrypt(data);
      const a = { password: val }
      resp.send(a);
})

app.post('/insert', allowCrossDomain, verifyToken, async (req, resp) => {
      let type = 'ADD_LOGIN';
      let id = '';
      let oname = req.body.org_name;
      let email = req.body.email;
      let pass = convertencrypt(req.body.password);
      let login = req.body.login_type;
      let userid = req.body.userId;
      let login_notes = req.body.login_notes || ''; // Optional field, default to empty string
      let username = req.body.username || ''; // Optional field, default to empty string
      mssql.query(mssqlConn, 'exec SP_LOGIN_DETAIL @TYPE=?,@ID=?,@O_NAME=?,@E_MAIL=?,@PASS =?,@LOGIN=?,@userID=?,@login_notes=?,@username=?', [type, id, oname, email, pass, login, userid, login_notes, username], (err, result) => {
            if (err) {
                  throw err;
            }
            else {
                  // Invalidate login detail caches after insert
                  deleteByPattern('getdata:*');
                  deleteByPattern('search:*');
                  deleteByPattern('getDataById:*');
                  resp.send(result);
            }
      });
});

app.post('/update', allowCrossDomain, verifyToken, async (req, resp) => {
      let type = 'EDIT_LOGIN';
      let id = req.body.Id;
      let oname = req.body.org_name;
      let email = req.body.email;
      let pass = convertencrypt(req.body.password);
      let login = req.body.login_type;
      let userid = req.body.userId;
      let login_notes = req.body.login_notes || ''; // Optional field, default to empty string
      mssql.query(mssqlConn, 'exec SP_LOGIN_DETAIL @TYPE=?,@ID=?,@O_NAME=?,@E_MAIL=?,@PASS =?,@LOGIN=?,@userID=?,@login_notes=?', [type, id, oname, email, pass, login, userid, login_notes], (err, result) => {
            if (err) {
                  throw err;
            }
            else {
                  // Invalidate login detail caches after update
                  deleteByPattern('getdata:*');
                  deleteByPattern('search:*');
                  deleteByPattern('getDataById:*');
                  resp.send(result);
            }
      });
});

app.post('/delete', allowCrossDomain, verifyToken, async (req, resp) => {
      let type = 'DELETE';
      let id = req.body.Id;
      let oname = '';
      let email = '';
      let pass = '';
      let login = '';
      let userid = '';
      let login_notes = req.body.login_notes || ''; // Optional field, default to empty string
      let username = req.body.username || ''; // Optional field, default to empty string
      mssql.query(mssqlConn, 'exec SP_LOGIN_DETAIL @TYPE=?,@ID=?,@O_NAME=?,@E_MAIL=?,@PASS =?,@LOGIN=?,@userID=?,@login_notes=?,@username=?', [type, id, oname, email, pass, login, userid, login_notes, username], (err, result) => {
            if (err) {
                  throw err;
            }
            else {
                  // Invalidate login detail caches after delete
                  deleteByPattern('getdata:*');
                  deleteByPattern('search:*');
                  deleteByPattern('getDataById:*');
                  resp.send(result);
            }
      });
});


//GetBy Id api using inline query
app.get('/getbyid/:id', async (req, res) => {
      const data = req.params.id;
      const cacheKey = `getbyid:${data}`;
      
      // Try cache first
      const cachedData = await getFromCache(cacheKey);
      if (cachedData) {
            return res.send(cachedData);
      }

      let id = data;
      mssql.query(mssqlConn, 'select * from Login_Detail where id=?', [id], (err, result) => {
            if (err) {
                  throw err;
            }
            else {
                  setToCache(cacheKey, result, 600); // Cache for 10 minutes
                  res.send(result);
            }
      })
});

app.get('/', async (req, resp) => {
      const cacheKey = 'root:all';
      
      // Try cache first
      const cachedData = await getFromCache(cacheKey);
      if (cachedData) {
            return resp.send(cachedData);
      }

      mssql.query(mssqlConn, 'select * from Login_Detail order by id desc', (err, result) => {
            if (!err) {
                  setToCache(cacheKey, result, 600); // Cache for 10 minutes
            }
            resp.send(result);
      });
});


app.get('/encrypt/:input', (req, resp) => {
      const a = req.params.input;
      resp.send(Buffer.from(a).toString('base64'));
      // const a = req.params.input;
      // resp.send(conevrtencrypt(a));
});

///ToDo List Api//
app.get('/getToDoList', async (req, resp) => {
      const selectedToDoDate = req.query.date; // Get the date from query parameters
      const cacheKey = selectedToDoDate ? `todo:date:${selectedToDoDate}` : 'todo:all';
      
      // Try cache first
      const cachedData = await getFromCache(cacheKey);
      if (cachedData) {
            return resp.send(cachedData);
      }

      let parameters = [];
      if (!selectedToDoDate) {
            const type = 'ALL';
            const id = '';
            const t_name = '';
            const t_disc = '';
            const ToDoDate = ''; // Optional field, default to empty string
            const notes = '';
            parameters = [type, id, t_name, t_disc, ToDoDate, notes];
      }
      else {
            const type = 'BY_DATE';
            const id = '';
            const t_name = '';
            const t_disc = '';
            const ToDoDate = selectedToDoDate; // Optional field, default to empty string
            const notes = '';
            parameters = [type, id, t_name, t_disc, ToDoDate, notes];
      }
      mssql.query(todoConn, 'exec ALL_TO_DO @TYPE=?, @id=?, @t_name=?, @t_disc=?, @date=?, @notes=?', parameters, (error, result) => {
            if (error) {
                  throw error;
            }
            else {
                  setToCache(cacheKey, result, 600); // Cache for 10 minutes
                  resp.send(result);
            }
      })
})

app.post('/addToDo', async (req, resp) => {
      const type = 'ADD';
      const id = '';
      const t_name = req.body.task_name;
      const t_disc = req.body.task_discription;
      const ToDoDate = req.body.ToDoDate || ''; // Optional field, default to empty string
      const notes = req.body.todo_notes || ''; // Optional field, default to empty string
      mssql.query(todoConn, 'exec ALL_TO_DO @TYPE=?, @id=?, @t_name=?, @t_disc=?, @date=?, @notes=?', [type, id, t_name, t_disc, ToDoDate, notes], (error, result) => {
            if (error) {
                  throw error;
            }
            else {
                  // Invalidate todo caches after add
                  deleteByPattern('todo:*');
                  resp.send(result);
            }
      })
})

app.post('/updateToDo', async (request, response) => {
      const type = 'UPDATE';
      const id = request.body.id;
      const t_name = request.body.task_name;
      const t_disc = request.body.task_discription;
      const ToDoDate = request.body.ToDoDate || ''; // Optional field, default to empty string
      const notes = request.body.todo_notes || ''; // Optional field, default to empty string
      mssql.query(todoConn, 'exec ALL_TO_DO @TYPE=?, @id=?, @t_name=?, @t_disc=?, @date=?, @notes=?', [type, id, t_name, t_disc, ToDoDate, notes], (error, result) => {
            if (error) {
                  return error;
            }
            else {
                  // Invalidate todo caches after update
                  deleteByPattern('todo:*');
                  response.send(result);
            }
      });
});

app.post('/deleteToDo', async (req, res) => {
      const type = 'DELETE';
      const id = req.body.id;
      const t_name = '';
      const t_disc = '';
      const ToDoDate = ''; // Optional field, default to empty string
      const notes = ''; // Optional field, default to empty string
      mssql.query(todoConn, 'exec ALL_TO_DO @TYPE=?, @id=?, @t_name=?, @t_disc=?, @date=?, @notes=?', [type, id, t_name, t_disc, ToDoDate, notes], (err, result) => {
            if (err) {
                  return err;
            }
            else {
                  // Invalidate todo caches after delete
                  deleteByPattern('todo:*');
                  res.send(result);
            }
      });
});

app.post('/editToDo', async (req, resp) => {
      let type = 'INDIVIDUAL';
      let id = req.body.id;
      const cacheKey = `todo:individual:${id}`;
      
      // Try cache first
      const cachedData = await getFromCache(cacheKey);
      if (cachedData) {
            return resp.send(cachedData);
      }

      let t_name = '';
      let t_disc = '';
      let ToDoDate = req.body.ToDoDate || ''; // Optional field, default to empty string
      let notes = req.body.todo_notes || ''; // Optional field, default to empty string
      mssql.query(todoConn, 'exec ALL_TO_DO @TYPE=?, @id=?, @t_name=?, @t_disc=?, @date=?, @notes=?', [type, id, t_name, t_disc, ToDoDate, notes], (error, result) => {
            if (error) {
                  throw error;
            }
            else {
                  setToCache(cacheKey, result, 600); // Cache for 10 minutes
                  resp.send(result);
            }
      })
})

async function sendEmail(emailData, emailSettings) {
      try {
            const transporter = nodemailer.createTransport({
                  host: emailSettings.Host,
                  port: emailSettings.Port,
                  secure: emailSettings.UseSSL, // true for 465, false for 587 or others
                  auth: {
                        user: emailSettings.EmailId,
                        pass: emailSettings.Password
                  }
            });

            const mailOptions = {
                  from: `"${emailSettings.Name}" <${emailSettings.EmailId}>`,
                  to: `"${emailData.EmailToName}" <${emailData.EmailToId}>`,
                  subject: emailData.EmailSubject,
                  text: emailData.EmailBody
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent:', info.messageId);
            return true;
      } catch (error) {
            console.error('Error sending email:', error);
            return false;
      }
}

function escapeSqlValue(value) {
      if (value === null || value === undefined) return 'NULL';
      return `'${String(value).replace(/'/g, "''")}'`; // escape single quotes
}

async function executeUserCheck(connection, t, emailToId, pass) {
      return new Promise((resolve, reject) => {
            const sqlQuery = `exec SP_USERCHECK ?, ?, ?, ?`;
            const params = [t, emailToId, pass, ''];
            connection.query(sqlQuery, params, (err, rows) => {
                  if (err) {
                        console.error("Error executing query:", err);
                        return reject(err);
                  }
                  // console.log("Query executed successfully:", rows);
                  resolve(rows);
            });
      });
}

app.post("/sendEmail", async (req, res) => {
      const t = 'VERIFY_USER';
      const emailData = {
            EmailToId: req.body.EmailToId,
            EmailToName: req.body.EmailToName,
            EmailSubject: req.body.EmailSubject,
            EmailBody: req.body.EmailBody
      };
      const emailSettings = {
            EmailId: "anand9304@gmail.com",
            Name: "Password recovery",
            Password: "reym pecm qdem grmx",
            Host: "smtp.gmail.com",
            Port: 465,
            UseSSL: true
      };
      //const username = req.body.EmailToId
      const pass = "";
      let activeDbConnection;
      // const sqlQuery = `exec SP_USERCHECK @TYPE=${escapeSqlValue(t)}, @USERNAME=${escapeSqlValue(emailData.EmailToId)}, @PASS=${escapeSqlValue(pass)}`;
      // console.log('Execution Statement', sqlQuery);
      // const request = new mssql.Request(mssqlConn);
      // request.input('TYPE', mssql.VarChar(50), t);
      // request.input('USERNAME', mssql.VarChar(255), emailData.EmailToId);
      // request.input('PASS', mssql.VarChar(255), pass);
      // const result = await request.execute(mssqlConn, sqlQuery);
      const connectionString = "server=ANAND-HOME;Database=browse_me_one;Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0}";


      mssql.open(connectionString, async (err, conn) => {
            if (err) {
                  console.error("Connection Error:", err);
                  return;
            }

            // IMPORTANT: 'conn' here is the actual connection object with the .query() method
            activeDbConnection = conn;
            console.log("msnodesqlv8 Connection Open.", activeDbConnection);

            const result = await executeUserCheck(activeDbConnection, t, emailData.EmailToId, pass);
            // console.log('Result', result);
            if (result && result.length > 0) {
                  const passwordFromDB = result[0].password || result[0].PASS || result[0].userPassword; // Adjust based on actual column name
                  emailData.EmailBody = emailData.EmailBody.concat(`${passwordFromDB} \n\n\nThanks\nSystem Generated`);
                  sendEmail(emailData, emailSettings);
                  return res.status(200).json({
                        message: 'Email sent successfully',
                        result: true
                  });
            }
            else {
                  return res.status(401).json({
                        message: 'Invalid user credentials',
                        result: false
                  });
            }

            // await mssql.query(mssqlConn, 'exec SP_USERCHECK @TYPE=?,@USERNAME=?,@PASS=?', [t, username, pass], (err, result) => {
            //       if (err) {
            //             console.error(err);
            //             return res.status(500).send('Database error');
            //       }
            //       const rows = result?.recordset;
            //       console.log('Rows', rows);
            //       if (!rows || rows.length === 0) {
            //             return res.status(401).send('Wrong credentials');
            //       }
            //       const passwordFromDB = rows[0].password || rows[0].PASS || rows[0].userPassword; // Adjust based on actual column name
            //       emailData.EmailBody = emailData.EmailBody.concat(`${passwordFromDB}`); // Convert <br> to new line
            //       sendEmail(emailData, emailSettings)
            //       res.status(200).send(result);
            //       // else {
            //       //       //resp.send(result);
            //       //       if (result.data == "[]") {
            //       //             resp.send('Wrong credentials');
            //       //       }
            //       //       else {
            //       //             emailData.EmailBody =  // Convert <br> to new line
            //       //                   sendEmail(emailData, emailSettings);
            //       //             res.send(result);
            //       //       }
            //       // }
            // });
            //}
      });
})

app.post('/sendSMS', async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    if (!mobileNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'mobileNumber and otp are required'
      });
    }

    const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
              route: 'otp',
              numbers: mobileNumber,
              variables_values: otp
      }, {
            headers: { authorization: process.env.FAST2SMS_KEY }
      });

    res.json({
      success: true,
      msg91Response: response.data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

if (require.main === module) {
      app.listen(2000, () => {
            console.log('Server is running on port 2000');
            //startServer();
      })
}
// function startServer() {
//   const PORT = process.env.PORT || 4000;

//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// }
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// if (process.argv[1] === __filename) {
//   app.listen(2000, () => {
//     startServer();
//   });
// }

module.exports = {
  convertencrypt,
  convertdecrypt,
  verifyToken,
  allowCrossDomain
};