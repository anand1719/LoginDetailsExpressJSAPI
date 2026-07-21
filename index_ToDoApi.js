const express = require('express');
const moment = require('moment');
const jwt = require('jsonwebtoken');


const mssql = require('msnodesqlv8')
const utf8 = require('utf8'); 
const cors = require('cors');

const { getFromCache, setToCache, deleteByPattern } = require('./redisClient');


const app = express();

const router = express.Router();

const todoConn = require('./todo_mssqlConnect');
app.use(express.json());

///ToDo List Api//

app.get('/getToDoList', async (req, resp) => {
    const cacheKey = 'todo:all';
    
    // Try cache first
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) {
        return resp.send(cachedData);
    }

    const type = 'ALL';
    const id = '';
    const t_name = '';
    const t_disc = '';
    mssql.query(todoConn, 'exec ALL_TO_DO @TYPE=?, @id=?,@t_name=?, @t_disc=?', [type, id, t_name, t_disc], (error, result) => {
        if (error) {
            throw error;
        }
        else {
            setToCache(cacheKey, result, 600); // Cache for 10 minutes
            resp.send(result);
        }
    });
});

app.post('/addToDo', async (req, resp) => {
    const Type = 'ADD';
    const id = '';
    const t_name = req.body.task_name;
    const t_disc = req.body.task_discription;
    mssql.query(todoConn, 'exec ALL_TO_DO @type=?,@id=?,@t_name=?,@t_disc=?', [Type, id, t_name, t_disc], (err, res) => {
        if (err) {
            throw err;
        }
        else {
            // Invalidate todo caches after add
            deleteByPattern('todo:*');
            resp.send("Inserted");
        }
    });
});

app.post('/updateToDo', async (request, response) => {
    const Type = 'UPDATE';
    const id = request.body.id;
    const t_name = request.body.task_name;
    const t_disc = request.body.task_discription;
    mssql.query(todoConn, 'exec ALL_TO_DO @type=?,@id=?,@t_name=?,@t_disc=?', [Type, id, t_name, t_disc], (err, result) => {
        if (err) {
            return err;
        }
        else {
            // Invalidate todo caches after update
            deleteByPattern('todo:*');
            response.send("Updated");
        }
    });
});

app.post('/deleteToDo', async (req, res) => {
    const type = 'DELETE';
    const id = req.body.id;
    const t_name = '';
    const t_disc = '';
    mssql.query(todoConn, 'exec ALL_TO_DO @type=?,@id=?,@t_name=?,@t_disc=?', [type, id, t_name, t_disc], (err, result) => {
        if (err) {
            return err;
        }
        else {
            // Invalidate todo caches after delete
            deleteByPattern('todo:*');
            res.send("Deleted");
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
    mssql.query(todoConn, 'exec ALL_TO_DO @type=?,@id=?,@t_name=?,@t_disc=?', [type, id, t_name, t_disc], (e, r) => {
        if (e) {
            throw e;
        }
        else {
            setToCache(cacheKey, r, 600); // Cache for 10 minutes
            resp.send(r);
        }
    });
});

app.listen(2501);
