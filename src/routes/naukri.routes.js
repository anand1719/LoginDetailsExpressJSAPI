const express = require('express');
const router = express.Router();
const naukriController = require('../controllers/naukri.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const corsMiddleware = require('../middleware/cors.middleware');

// GET /api/naukri - Get all Naukri records
router.get('/', corsMiddleware, verifyToken, naukriController.getAll);

// POST /api/naukri/get-by-id - Get by ID
router.post('/get-by-id', corsMiddleware, verifyToken, naukriController.getById);

// POST /api/naukri/insert - Insert new record (with image upload)
router.post('/insert', corsMiddleware, verifyToken, naukriController.uploadMiddleware, naukriController.insert);

// POST /api/naukri/update - Update existing record (with image upload)
router.post('/update', corsMiddleware, verifyToken, naukriController.uploadMiddleware, naukriController.update);

// POST /api/naukri/delete - Delete a record
router.post('/delete', corsMiddleware, verifyToken, naukriController.remove);

module.exports = router;