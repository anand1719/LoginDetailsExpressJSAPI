const mssql = require('msnodesqlv8');
const { mssqlConn } = require('../config/database');
const { encrypt, decrypt } = require('../utils/encryption');
const { getFromCache, setToCache, deleteByPattern } = require('./redis.service');

const STORED_PROC = 'exec SP_LOGIN_DETAIL @TYPE=?,@ID=?,@O_NAME=?,@E_MAIL=?,@PASS =?,@LOGIN=?,@userID=?,@login_notes=?,@username=?';

/**
 * Fetch all login details with caching
 */
async function getAll(username) {
  const cacheKey = 'getdata:all';
  const cachedData = await getFromCache(cacheKey);
  if (cachedData) return cachedData;

  return new Promise((resolve, reject) => {
    mssql.query(mssqlConn, STORED_PROC, ['GET_ALL', '', '', '', '', '', '', '', username || ''], (err, result) => {
      if (err) return reject(err);
      setToCache(cacheKey, result, 600);
      resolve(result);
    });
  });
}

/**
 * Search login details with caching
 */
async function search(query, username) {
  const cacheKey = `search:${query}`;
  const cachedData = await getFromCache(cacheKey);
  if (cachedData) return cachedData;

  return new Promise((resolve, reject) => {
    mssql.query(mssqlConn, STORED_PROC, ['GET_ANY', '', query, '', '', '', '', '', username || ''], (err, result) => {
      if (err) return reject(err);
      setToCache(cacheKey, result, 600);
      resolve(result);
    });
  });
}

/**
 * Get login detail by ID with decrypted password
 */
async function getById(id, username) {
  const cacheKey = `getDataById:${id}`;
  const cachedData = await getFromCache(cacheKey);
  if (cachedData) return cachedData;

  return new Promise((resolve, reject) => {
    mssql.query(mssqlConn, STORED_PROC, ['GET_LOGIN', id, '', '', '', '', '', '', username || ''], (err, result) => {
      if (err) return reject(err);
      const val = result.find(e => e.id == id);
      if (val) {
        val.password = decrypt(val.password);
        const responseData = [val];
        setToCache(cacheKey, responseData, 600);
        resolve(responseData);
      } else {
        resolve([]);
      }
    });
  });
}

/**
 * Insert a new login record
 */
async function insert(data) {
  return new Promise((resolve, reject) => {
    mssql.query(mssqlConn, STORED_PROC, [
      'ADD_LOGIN', '', data.org_name, data.email,
      encrypt(data.password), data.login_type, data.userId,
      data.login_notes || '', data.username || ''
    ], (err, result) => {
      if (err) return reject(err);
      invalidateLoginCache();
      resolve(result);
    });
  });
}

/**
 * Update an existing login record
 */
async function update(data) {
  return new Promise((resolve, reject) => {
    mssql.query(mssqlConn, 'exec SP_LOGIN_DETAIL @TYPE=?,@ID=?,@O_NAME=?,@E_MAIL=?,@PASS =?,@LOGIN=?,@userID=?,@login_notes=?', [
      'EDIT_LOGIN', data.Id, data.org_name, data.email,
      encrypt(data.password), data.login_type, data.userId,
      data.login_notes || ''
    ], (err, result) => {
      if (err) return reject(err);
      invalidateLoginCache();
      resolve(result);
    });
  });
}

/**
 * Delete a login record
 */
async function remove(id, login_notes, username) {
  return new Promise((resolve, reject) => {
    mssql.query(mssqlConn, STORED_PROC, ['DELETE', id, '', '', '', '', '', login_notes || '', username || ''], (err, result) => {
      if (err) return reject(err);
      invalidateLoginCache();
      resolve(result);
    });
  });
}

/**
 * Get by ID using inline query
 */
async function getByParamId(id) {
  const cacheKey = `getbyid:${id}`;
  const cachedData = await getFromCache(cacheKey);
  if (cachedData) return cachedData;

  return new Promise((resolve, reject) => {
    mssql.query(mssqlConn, 'select * from Login_Detail where id=?', [id], (err, result) => {
      if (err) return reject(err);
      setToCache(cacheKey, result, 600);
      resolve(result);
    });
  });
}

/**
 * Get all login details ordered by id descending
 */
async function getAllOrdered() {
  const cacheKey = 'root:all';
  const cachedData = await getFromCache(cacheKey);
  if (cachedData) return cachedData;

  return new Promise((resolve, reject) => {
    mssql.query(mssqlConn, 'select * from Login_Detail order by id desc', (err, result) => {
      if (!err) {
        setToCache(cacheKey, result, 600);
      }
      resolve(result);
    });
  });
}

async function invalidateLoginCache() {
  await deleteByPattern('getdata:*');
  await deleteByPattern('search:*');
  await deleteByPattern('getDataById:*');
}

module.exports = {
  getAll,
  search,
  getById,
  insert,
  update,
  remove,
  getByParamId,
  getAllOrdered
};