const mssql = require('msnodesqlv8');
const { jobSearchConn } = require('../config/database');
const { encrypt, decrypt } = require('../utils/encryption');
const { getFromCache, setToCache, deleteByPattern } = require('./redis.service');

const STORED_PROC = 'exec sp_job_dtl @type=?,@id=?,@name=?,@userid=?,@email=?,@password=?,@notes=?,@image=?,@reg_date=?';

/**
 * Get all Naukri/job records with caching
 */
async function getAll() {
  const cacheKey = 'naukri:all';
  const cachedData = await getFromCache(cacheKey);
  if (cachedData) return cachedData;

  return new Promise((resolve, reject) => {
    const params = ['ALL', null, null, null, null, null, null, Buffer.from(''), null];
    mssql.query(jobSearchConn, STORED_PROC, params, (err, result) => {
      if (err) return reject(err);
      setToCache(cacheKey, result, 600);
      resolve(result);
    });
  });
}

/**
 * Get a single Naukri record by ID with caching
 */
async function getById(id) {
  const cacheKey = `naukri:byid:${id}`;
  const cachedData = await getFromCache(cacheKey);
  if (cachedData) return cachedData;

  return new Promise((resolve, reject) => {
    mssql.query(jobSearchConn, STORED_PROC, [
      'BYID', id, '', '', '', '', '', Buffer.from(''), null
    ], (err, result) => {
      if (err) return reject(err);
      const value = result.find(e => e.id == id);
      if (value) {
        value.password = decrypt(value.password);
        setToCache(cacheKey, value, 600);
        resolve(value);
      } else {
        resolve([]);
      }
    });
  });
}

/**
 * Insert a new Naukri/job record
 */
async function insert(data) {
  return new Promise((resolve, reject) => {
    const pass = encrypt(data.company_regpass);

    mssql.query(jobSearchConn, STORED_PROC, [
      'INSERT', 0, data.companyname, '', data.company_regemail,
      pass, data.notes || '', data.image || null, data.reg_date || null
    ], (err, result) => {
      if (err) return reject(err);
      deleteByPattern('naukri:*');
      resolve(result);
    });
  });
}

/**
 * Update an existing Naukri/job record
 */
async function update(data) {
  return new Promise((resolve, reject) => {
    const pass = encrypt(data.company_regpass);
    const reg_date = data.reg_date ? new Date(data.reg_date) : null;
    const localDate = reg_date ? new Date(reg_date.getTime() - reg_date.getTimezoneOffset() * 60000) : null;

    mssql.query(jobSearchConn, STORED_PROC, [
      'UPDATE', data.companyid, data.companyname, '', data.company_regemail,
      pass, data.notes || '', data.image || null, localDate
    ], (err, result) => {
      if (err) return reject(err);
      deleteByPattern('naukri:*');
      resolve(result);
    });
  });
}

/**
 * Delete a Naukri/job record
 */
async function remove(id) {
  return new Promise((resolve, reject) => {
    mssql.query(jobSearchConn, STORED_PROC, [
      'DELETE', id, '', '', '', '', '', Buffer.from(''), null
    ], (err, result) => {
      if (err) return reject(err);
      deleteByPattern('naukri:*');
      resolve(result);
    });
  });
}

module.exports = {
  getAll,
  getById,
  insert,
  update,
  remove
};