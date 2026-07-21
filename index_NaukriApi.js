//import { marked } from 'marked'; 
const express = require('express');
//import express from 'express';
const marked  = require('marked');
 const mysql = require('mysql2');
 const { Client } = require('pg');
const cors = require('cors');
//import cors from 'cors';
const { getFromCache, setToCache, deleteByPattern } = require('./redisClient');
const app = express();
 const moment = require('moment');
 const mysqlClient = require('./mysql_NaukriConnection');
 //const pgp = require('pg-promise')
 //const client = require('./postgreSqlConnection');
const multer = require('multer');
//import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });
app.use(express.json());


const mssql = require('msnodesqlv8');
//import mssql from 'msnodesqlv8';
const { mssqlConn, jobSearchConn } = require('./mssqlConnection');
//import { mssqlConn,jobSearchConn } from './mssqlConnection.js';
const { convertencrypt, convertdecrypt, verifyToken } = require('./index_General');
//import { convertencrypt, convertdecrypt, verifyToken } from './index_General.js';

const allowedOrigins = [
    'http://localhost:3001',
    'http://localhost:3000'
]
var allowCrossDomain = function (req, res, next) {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
}



app.use(cors({
    origin: allowedOrigins// Allow frontend to access this API
}));

app.use(allowCrossDomain);

//#region Using PostgreSql Database 
// app.get('/getAllNaukriDetails', (req, resp) => {
//   let ptype = 'ALL';
//     let companyid = 0;
//     let companyname = '';
//     let company_regemail = '';
//     let company_regpass = '';

//     //client.query("select * from companyinfo",(err,result)=>{
//     //  client.query('CALL naukri($1,$2,$3,$4)', [ companyid, companyname, company_regemail, company_regpass], (err, result) => {
//     //client.query('select naukri($1)',[companyname],(err,result)=>{
//         mssql.query(mssqlConn, 'exec naukri @ptype=?, @companyid=?, @companyname=?, @company_regemail=?, @company_regpass=?', [companyid, companyname, company_regemail, company_regpass], (err, result) => {
//         if (err) {
//             throw err;
//         }
//         else {
//             resp.send(result.rows);
//         }
//     });
// });
//#endregion
//#region Using MYSQL Databse previously
//Now using MSSQL
app.get('/getAllNaukri', allowCrossDomain, verifyToken, async (req, resp) => {
    const cacheKey = 'naukri:all';
    
    // Try cache first
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) {
        return resp.send(cachedData);
    }

    let ptype = 'ALL';
    let id = null;
    let pname = null;
    let pass = null;
    let email = null;
    let userid = null;
    let notes = null;
    //let image =  null;
    let image = Buffer.from(''); //  just for testing
    let reg_date = null;

    const params = [ptype, id, pname, userid, email, pass, notes, image, reg_date];

    await mssql.query(
        jobSearchConn,
        'exec sp_job_dtl @type=?,@id=?,@name=?,@userid=?,@email=?,@password=?,@notes=?,@image=?,@reg_date=?',
        params,
        (err, result) => {
            if (err) {
                console.error(err);
                return resp.status(500).json({ error: err.message });
            } else {
                setToCache(cacheKey, result, 600); // Cache for 10 minutes
                resp.send(result);
            }
        }
    );
});

app.post('/getNaukriById', allowCrossDomain, verifyToken, async (req, resp) => {
    let ptype = 'BYID';
    let id = req.body.id;
    const cacheKey = `naukri:byid:${id}`;
    
    // Try cache first
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) {
        return resp.send(cachedData);
    }

    let pname = '';
    let pass = '';
    let email = '';
    let userid = '';
    let notes = '';
    let image = Buffer.from(''); //  just for testing
    let reg_date = null;

    await mssql.query(jobSearchConn, 'exec sp_job_dtl @type=?,@id=?, @name=?, @userid=?,@email=?, @password=?,@notes=?,@image=?,@reg_date=?', [ptype, id, pname, userid, email, pass, notes, image, reg_date], (err, result) => {
        if (err) {
            throw err;
        }
        else {
            let value = result.find(function (e) {
                return e.id == id;
            });
            if (value) {
                value.password = convertdecrypt(value.password);
                setToCache(cacheKey, value, 600); // Cache for 10 minutes
                resp.send(value);
            }
            else {
                resp.send([]);
            }
        }
    });
});

// app.post('/insertNaukri', allowCrossDomain, verifyToken, upload.any(), async (req, resp) => {
//     let ptype = 'INSERT';
//     let id = 0;
//     let pname = Array.isArray(req.body.companyname) ? req.body.companyname[0] : req.body.companyname;    console.log('companyname:', req.body.companyname);
//     let pass = Array.isArray(req.body.company_regpass) ? convertencrypt(req.body.company_regpass[0]) : convertencrypt(req.body.company_regpass); // Handle case where company_regpass is an array
//     let email = Array.isArray(req.body.company_regemail) ? req.body.company_regemail[0] : req.body.company_regemail; // Handle case where company_regemail is an array
//     console.log('company_regemail:', req.body.company_regemail);    
//     let userid = '';
//     let notes = Array.isArray(req.body.notes) ? req.body.notes[0] : req.body.notes; // Handle case where notes is an array
//     console.log('notes:', req.body.notes);
//     let image = req.file ? req.file.buffer : null; // Assuming the image is sent as a file in the request
//     console.log('image type:', typeof req.body.image);
//     console.log('image file:', req.body.image);
//     //await mysqlClient.query('call EMPLOYER.NAUKRI_REGISTER(?,?,?,?,?)
//     await mssql.query(jobSearchConn, 'exec sp_job_dtl @type=?,@id=?, @name=?, @userid=?,@email=?, @password=?,@notes=?,@image=?', [ptype, id, pname, userid, email, pass, notes, image], (err, result) => {
//         //await mysqlClient.query('call EMPLOYER.NAUKRI_REGISTER(?,?,?,?,?)', [ptype, id, pname, email, pass], (err, result) => {
//         if (err) {
//             throw err;
//         }
//         else {
//             resp.send(result);
//         }
//     });
// });

app.post('/insertNaukri', allowCrossDomain, verifyToken, upload.single('image'), async (req, resp) => {
  try {
    const ptype = 'INSERT';
    const id = 0;

    // Safely extract text fields
    const companyname = Array.isArray(req.body.companyname)
      ? req.body.companyname[0]
      : req.body.companyname; 

    const company_regpass = Array.isArray(req.body.company_regpass)
      ? req.body.company_regpass[0]
      : req.body.company_regpass;

    const company_regemail = Array.isArray(req.body.company_regemail)
      ? req.body.company_regemail[0]
      : req.body.company_regemail;

    const notes = Array.isArray(req.body.notes)
      ? req.body.notes[0]
      : req.body.notes;

    const pass = convertencrypt(company_regpass);
    const userid = ''; // Can be filled if needed

    // Extract image file from multer
    const imageFile = req.files?.find((f) => f.fieldname === 'image');
    const image = req.file ? req.file.buffer : null;
   const reg_date = Array.isArray(req.body.reg_date)
  ? req.body.reg_date[0]
  : req.body.reg_date;

    // Execute MSSQL stored procedure
    await mssql.query(
      jobSearchConn,
      'exec sp_job_dtl @type=?, @id=?, @name=?, @userid=?, @email=?, @password=?, @notes=?, @image=?, @reg_date=?',
      [ptype, id, companyname, userid, company_regemail, pass, notes, image, reg_date],
      (err, result) => {
        if (err) {
          console.error('SQL Error:', err);
          return resp.status(500).json({ error: 'Database error', details: err });
        }
        // Invalidate naukri caches after insert
        deleteByPattern('naukri:*');
        resp.status(200).json({ success: true, result });
      }
    );
  } catch (error) {
    console.error('Unhandled error:', error);
    resp.status(500).json({ error: 'Server error', details: error.message });
  }
});


app.post('/updateNaukri', allowCrossDomain, verifyToken, upload.single('image'), async (req, resp) => {
    let ptype = 'UPDATE';
    let id = req.body.companyid;
    let pname = req.body.companyname;
    let pass = convertencrypt(req.body.company_regpass);
    let email = req.body.company_regemail;
    let userid = '';
    let notes = req.body.notes;
    const imageFile = req.files?.find((f) => f.fieldname === 'image');
    let image = req.file ? req.file.buffer : null;
    const reg_date = new Date(req.body.reg_date);
    const localDate = new Date(reg_date.getTime() - reg_date.getTimezoneOffset() * 60000);
    console.log('req.body:', req.body);
    await mssql.query(jobSearchConn, 'exec sp_job_dtl @type=?,@id=?, @name=?, @userid=?,@email=?, @password=?,@notes=?,@image=?,@reg_date=?', [ptype, id, pname, userid, email, pass, notes, image, localDate], (err, result) => {
        if (err) {
            throw err;
        }
        else {
            // Invalidate naukri caches after update
            deleteByPattern('naukri:*');
            resp.send(result);
        }
    });
});

app.post('/deleteNaukri', allowCrossDomain, verifyToken, async (req, resp) => {
    let ptype = 'DELETE';
    let id = req.body.id;
    let pname = '';
    let pass = '';
    let email = '';
    let userid = '';
    let notes = '';
    let image = Buffer.from(''); //  just for testing
    let reg_date = null;
    await mssql.query(jobSearchConn, 'exec sp_job_dtl @type=?,@id=?, @name=?, @userid=?,@email=?, @password=?,@notes=?,@image=?,@reg_date=?', [ptype, id, pname, userid, email, pass, notes, image, reg_date], (err, result) => {
        if (err) {
            throw err;
        }
        else {
            // Invalidate naukri caches after delete
            deleteByPattern('naukri:*');
            resp.send('Deleted');
        }
    });
});
//#endregion

app.listen(4000);
