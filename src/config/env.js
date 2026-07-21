const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'uzVnO6REt4afkn3XGSlbxxI7qAJFzttYhLWY8r1cDCmiccKWFwkubkGa9B5tffjNBqdXVO3ss7BRXwKN',
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  TAVILY_API_KEY: process.env.TAVILY_API_KEY,
  FAST2SMS_KEY: process.env.FAST2SMS_KEY,

  CORS_ORIGINS: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:4200',
    'http://localhost:8081'
  ],

  // Database connection strings (will be enhanced to use env vars later)
  MSSQL_CONN_STRING: process.env.MSSQL_CONN_STRING || 'server=ANAND-HOME;Database=browse_me_one;Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0}',
  JOBSEARCH_CONN_STRING: process.env.JOBSEARCH_CONN_STRING || 'server=ANAND-HOME;Database=JOBSEARCH;Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0}',

  // Email defaults
  EMAIL: {
    ID: process.env.EMAIL_ID || 'anand9304@gmail.com',
    NAME: process.env.EMAIL_NAME || 'Password recovery',
    PASSWORD: process.env.EMAIL_PASSWORD || 'reym pecm qdem grmx',
    HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
    PORT: parseInt(process.env.EMAIL_PORT, 10) || 465,
    USE_SSL: process.env.EMAIL_USE_SSL !== 'false'
  },

  // Cache defaults
  CACHE_TTL: parseInt(process.env.CACHE_TTL, 10) || 600, // 10 minutes
};