const config = require('../config/env');

/**
 * Encrypt a string using base64 encoding with the encryption key
 * @param {string} string - The plain text to encrypt
 * @returns {string} - Base64 encoded encrypted string
 */
function encrypt(string) {
  const key = config.ENCRYPTION_KEY;
  return Buffer.from(string + key).toString('base64');
}

/**
 * Decrypt a base64 encoded encrypted string
 * @param {string} string - The base64 encoded string to decrypt
 * @returns {string} - Decrypted plain text
 */
function decrypt(string) {
  const key = config.ENCRYPTION_KEY;
  const decoded = Buffer.from(string, 'base64').toString('utf-8');
  if (decoded.endsWith(key)) {
    return decoded.slice(0, -key.length);
  }
  return decoded;
}

module.exports = {
  encrypt,
  decrypt
};