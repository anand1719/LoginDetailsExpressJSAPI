const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Middleware to verify JWT token from Authorization header
 */
function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];

  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const token = bearer[1];

    jwt.verify(token, config.JWT_SECRET, (err, authData) => {
      if (err) {
        return res.status(403).json({ message: 'Token is not valid' });
      }
      req.authData = authData;
      next();
    });
  } else {
    return res.status(403).json({ message: 'No token provided' });
  }
}

module.exports = { verifyToken };