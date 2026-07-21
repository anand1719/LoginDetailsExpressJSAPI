const mssql = require('msnodesqlv8');
const { todoConn } = require('../config/todoDatabase');
const { getFromCache, setToCache, deleteByPattern } = require('./redis.service');

const STORED_PROC = 'exec ALL_TO_DO @TYPE=?, @id=?, @t_name=?, @t_disc=?, @date=?, @notes=?';

/**
 * Get all ToDo items or filter by date with caching
 */
async function getAll(selectedToDoDate) {
  const cacheKey = selectedToDoDate ? `todo:date:${selectedToDoDate}` : 'todo:all';
  const cachedData = await getFromCache(cacheKey);
  if (cachedData) return cachedData;

  return new Promise((resolve, reject) => {
    let parameters;
    if (!selectedToDoDate) {
      parameters = ['ALL', '', '', '', '', ''];
    } else {
      parameters = ['BY_DATE', '', '', '', selectedToDoDate, ''];
    }

    mssql.query(todoConn, STORED_PROC, parameters, (error, result) => {
      if (error) return reject(error);
      setToCache(cacheKey, result, 600);
      resolve(result);
    });
  });
}

/**
 * Add a new ToDo item
 */
async function add(data) {
  return new Promise((resolve, reject) => {
    mssql.query(todoConn, STORED_PROC, [
      'ADD', '', data.task_name, data.task_discription,
      data.ToDoDate || '', data.todo_notes || ''
    ], (error, result) => {
      if (error) return reject(error);
      deleteByPattern('todo:*');
      resolve(result);
    });
  });
}

/**
 * Update an existing ToDo item
 */
async function update(data) {
  return new Promise((resolve, reject) => {
    mssql.query(todoConn, STORED_PROC, [
      'UPDATE', data.id, data.task_name, data.task_discription,
      data.ToDoDate || '', data.todo_notes || ''
    ], (error, result) => {
      if (error) return reject(error);
      deleteByPattern('todo:*');
      resolve(result);
    });
  });
}

/**
 * Delete a ToDo item
 */
async function remove(id) {
  return new Promise((resolve, reject) => {
    mssql.query(todoConn, STORED_PROC, ['DELETE', id, '', '', '', ''], (err, result) => {
      if (err) return reject(err);
      deleteByPattern('todo:*');
      resolve(result);
    });
  });
}

/**
 * Get a single ToDo item by ID with caching
 */
async function getById(id) {
  const cacheKey = `todo:individual:${id}`;
  const cachedData = await getFromCache(cacheKey);
  if (cachedData) return cachedData;

  return new Promise((resolve, reject) => {
    mssql.query(todoConn, STORED_PROC, ['INDIVIDUAL', id, '', '', '', ''], (error, result) => {
      if (error) return reject(error);
      setToCache(cacheKey, result, 600);
      resolve(result);
    });
  });
}

module.exports = {
  getAll,
  add,
  update,
  remove,
  getById
};