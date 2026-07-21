const express = require('express');
const router = express.Router();
const loginController = require('../controllers/login.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const corsMiddleware = require('../middleware/cors.middleware');

// Public routes
router.get('/encrypt/:input', loginController.encryptInput);
router.post('/decrypt', corsMiddleware, loginController.decryptPassword);

// Protected routes (require JWT token)
router.post('/search', corsMiddleware, verifyToken, loginController.search);
router.post('/insert', corsMiddleware, verifyToken, loginController.insert);
router.post('/update', corsMiddleware, verifyToken, loginController.update);
router.post('/delete', corsMiddleware, verifyToken, loginController.remove);
router.post('/get-by-id', corsMiddleware, loginController.getById);

// Public routes (with cors)
router.get('/', corsMiddleware, loginController.getAll);
router.get('/ordered', loginController.getAllOrdered);
router.get('/by-param/:id', loginController.getByParamId);

module.exports = router;