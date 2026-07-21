const mssql = require('msnodesqlv8');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { mssqlConn } = require('../config/database');

/**
 * Authenticate a user against the database and return a JWT token
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{user: object, token: string}>}
 */
async function signIn(username, password) {
  return new Promise((resolve, reject) => {
    const type = 'CHECK_USER';

    mssql.query(
      mssqlConn,
      'exec SP_USERCHECK @TYPE=?,@USERNAME=?,@PASS=?,@USEREMAIL=?',
      [type, username, password, ''],
      (err, result) => {
        if (err) {
          return reject(err);
        }

        const user = result[0];

        if (!user || user.length === 0) {
          return reject(new Error('Wrong credentials'));
        }

        const payload = {
          username: user.username,
          user_type: user.user_type,
          user_email: user.user_email
        };

        jwt.sign(payload, config.JWT_SECRET, { expiresIn: '3600s' }, (err, token) => {
          if (err) {
            return reject(new Error('Token generation failed'));
          }
          resolve({ user: payload, token });
        });
      }
    );
  });
}

/**
 * Execute SP_USERCHECK stored procedure
 * @param {object} connection - msnodesqlv8 connection object
 * @param {string} t - query type
 * @param {string} emailToId - email/user identifier
 * @param {string} pass - password
 * @returns {Promise<Array>}
 */
async function executeUserCheck(connection, t, emailToId, pass) {
  return new Promise((resolve, reject) => {
    const sqlQuery = 'exec SP_USERCHECK ?, ?, ?, ?';
    const params = [t, emailToId, pass, ''];
    connection.query(sqlQuery, params, (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        return reject(err);
      }
      resolve(rows);
    });
  });
}

module.exports = {
  signIn,
  executeUserCheck
};