/**
 * LoginDetailsNodeJs-API
 * Production-ready Express API Server
 *
 * Web API project with MSSQL, MySQL, PostgreSQL, Redis, and more
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config/env');
const corsMiddleware = require('./middleware/cors.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const loginRoutes = require('./routes/login.routes');
const todoRoutes = require('./routes/todo.routes');
const naukriRoutes = require('./routes/naukri.routes');
const chatRoutes = require('./routes/chat.routes');

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
// API Routes
// =============================================
app.use('/api/auth', authRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/todo', todoRoutes);
app.use('/api/naukri', naukriRoutes);
app.use('/api/chat', chatRoutes);

// =============================================
// Legacy route aliases (backward compatibility)
// =============================================
app.post('/getUserSignIn', require('./controllers/auth.controller').signIn);
app.post('/sendEmail', require('./controllers/auth.controller').sendEmail);
app.post('/sendSMS', require('./controllers/auth.controller').sendSms);
app.post('/chat', require('./controllers/chat.controller').chat);

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
const PORT = process.env.PORT || config.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API Base: http://localhost:${PORT}/api`);
});

module.exports = app;