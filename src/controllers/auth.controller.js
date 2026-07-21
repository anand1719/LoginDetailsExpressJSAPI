const authService = require('../services/auth.service');
const mssql = require('msnodesqlv8');
const config = require('../config/env');
const { mssqlConn } = require('../config/database');
const axios = require('axios');
const nodemailer = require('nodemailer');

/**
 * POST /api/auth/signin
 * Authenticate user and return JWT token
 */
async function signIn(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const result = await authService.signIn(username, password);
    res.json({ token: result.token });
  } catch (error) {
    console.error(error);
    if (error.message === 'Wrong credentials') {
      return res.status(401).send('Wrong credentials');
    }
    res.status(500).json({ error: 'Database error' });
  }
}

/**
 * POST /api/auth/send-email
 * Send password recovery email
 */
async function sendEmail(req, res) {
  try {
    const t = 'VERIFY_USER';
    const emailData = {
      EmailToId: req.body.EmailToId,
      EmailToName: req.body.EmailToName,
      EmailSubject: req.body.EmailSubject,
      EmailBody: req.body.EmailBody
    };

    const emailSettings = {
      EmailId: config.EMAIL.ID,
      Name: config.EMAIL.NAME,
      Password: config.EMAIL.PASSWORD,
      Host: config.EMAIL.HOST,
      Port: config.EMAIL.PORT,
      UseSSL: config.EMAIL.USE_SSL
    };

    const pass = '';
    const connectionString = config.MSSQL_CONN_STRING;

    mssql.open(connectionString, async (err, conn) => {
      if (err) {
        console.error('Connection Error:', err);
        return res.status(500).json({ error: 'Database connection error' });
      }

      const result = await authService.executeUserCheck(conn, t, emailData.EmailToId, pass);

      if (result && result.length > 0) {
        const passwordFromDB = result[0].password || result[0].PASS || result[0].userPassword;
        emailData.EmailBody = emailData.EmailBody.concat(`${passwordFromDB}\n\n\nThanks\nSystem Generated`);

        const transporter = nodemailer.createTransport({
          host: emailSettings.Host,
          port: emailSettings.Port,
          secure: emailSettings.UseSSL,
          auth: {
            user: emailSettings.EmailId,
            pass: emailSettings.Password
          }
        });

        const mailOptions = {
          from: `"${emailSettings.Name}" <${emailSettings.EmailId}>`,
          to: `"${emailData.EmailToName}" <${emailData.EmailToId}>`,
          subject: emailData.EmailSubject,
          text: emailData.EmailBody
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);

        return res.status(200).json({ message: 'Email sent successfully', result: true });
      } else {
        return res.status(401).json({ message: 'Invalid user credentials', result: false });
      }
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/auth/send-sms
 * Send OTP via SMS
 */
async function sendSms(req, res) {
  try {
    const { mobileNumber } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    if (!mobileNumber || !otp) {
      return res.status(400).json({ success: false, message: 'mobileNumber and otp are required' });
    }

    const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
      route: 'otp',
      numbers: mobileNumber,
      variables_values: otp
    }, {
      headers: { authorization: config.FAST2SMS_KEY }
    });

    res.json({ success: true, msg91Response: response.data });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
}

module.exports = {
  signIn,
  sendEmail,
  sendSms
};