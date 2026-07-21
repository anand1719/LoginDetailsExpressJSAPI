/**
 * LoginDetailsNodeJs-API
 * Production-ready Express API Server
 *
 * Web API project with MSSQL, MySQL, PostgreSQL, Redis, and more
 * 
 * All endpoints are registered at root level to match the original paths
 * e.g. http://localhost:2000/getdata, http://localhost:2000/search, etc.
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config/env');
const corsMiddleware = require('./middleware/cors.middleware');
const { verifyToken } = require('./middleware/auth.middleware');

// Import controllers
const authController = require('./controllers/auth.controller');
const loginController = require('./controllers/login.controller');
const todoController = require('./controllers/todo.controller');
const naukriController = require('./controllers/naukri.controller');
const chatController = require('./controllers/chat.controller');

// Initialize Express app
const app = express();

// =============================================
// Global Middleware
// =============================================
app.use(cors({ origin: config.CORS_ORIGINS }));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// =============================================
// Health Check
// =============================================
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// =============================================
// Auth Routes
// =============================================
app.post('/getUserSignIn', corsMiddleware, authController.signIn);
app.post('/sendEmail', authController.sendEmail);
app.post('/sendSMS', authController.sendSms);

// =============================================
// Login Detail Routes (from index_General.js)
// =============================================
app.get('/getdata', corsMiddleware, loginController.getAll);
app.post('/search', corsMiddleware, verifyToken, loginController.search);
app.post('/getDataById', corsMiddleware, loginController.getById);
app.post('/insert', corsMiddleware, verifyToken, loginController.insert);
app.post('/update', corsMiddleware, verifyToken, loginController.update);
app.post('/delete', corsMiddleware, verifyToken, loginController.remove);
app.get('/getbyid/:id', loginController.getByParamId);
app.get('/', loginController.getAllOrdered);
app.get('/encrypt/:input', loginController.encryptInput);
app.post('/decrypt', corsMiddleware, loginController.decryptPassword);

// =============================================
// ToDo Routes (from index_General.js & index_ToDoApi.js)
// =============================================
app.get('/getToDoList', todoController.getAll);
app.post('/addToDo', todoController.add);
app.post('/updateToDo', todoController.update);
app.post('/deleteToDo', todoController.remove);
app.post('/editToDo', todoController.getById);

// =============================================
// Naukri Routes (from index_NaukriApi.js)
// =============================================
app.get('/getAllNaukri', corsMiddleware, verifyToken, naukriController.getAll);
app.post('/getNaukriById', corsMiddleware, verifyToken, naukriController.getById);
app.post('/insertNaukri', corsMiddleware, verifyToken, naukriController.uploadMiddleware, naukriController.insert);
app.post('/updateNaukri', corsMiddleware, verifyToken, naukriController.uploadMiddleware, naukriController.update);
app.post('/deleteNaukri', corsMiddleware, verifyToken, naukriController.remove);

// =============================================
// Chat Routes
// =============================================
app.post('/chat', verifyToken, chatController.chat);

// =============================================
// 404 Handler
// =============================================
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// =============================================
// Global Error Handler
// =============================================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// =============================================
// Start Server
// =============================================
const PORT = process.env.PORT || config.PORT || 2000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
});

module.exports = app;