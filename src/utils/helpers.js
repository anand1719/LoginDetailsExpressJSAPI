/**
 * Escape a value for use in SQL queries (basic protection against SQL injection)
 * @param {*} value - The value to escape
 * @returns {string} - Escaped SQL value
 */
function escapeSqlValue(value) {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
}

/**
 * Generate a random OTP of given length
 * @param {number} length - Number of digits (default: 6)
 * @returns {string} - OTP string
 */
function generateOtp(length = 6) {
  return Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
}

module.exports = {
  escapeSqlValue,
  generateOtp
};