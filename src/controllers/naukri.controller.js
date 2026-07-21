const naukriService = require('../services/naukri.service');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

/**
 * GET /api/naukri
 * Get all Naukri/job records
 */
async function getAll(req, res) {
  try {
    const result = await naukriService.getAll();
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/naukri/get-by-id
 * Get a single Naukri record by ID
 */
async function getById(req, res) {
  try {
    const id = req.body.id;
    const result = await naukriService.getById(id);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/naukri/insert
 * Insert a new Naukri record (with optional image upload)
 */
async function insert(req, res) {
  try {
    const data = {
      companyname: Array.isArray(req.body.companyname) ? req.body.companyname[0] : req.body.companyname,
      company_regpass: Array.isArray(req.body.company_regpass) ? req.body.company_regpass[0] : req.body.company_regpass,
      company_regemail: Array.isArray(req.body.company_regemail) ? req.body.company_regemail[0] : req.body.company_regemail,
      notes: Array.isArray(req.body.notes) ? req.body.notes[0] : req.body.notes,
      image: req.file ? req.file.buffer : null,
      reg_date: Array.isArray(req.body.reg_date) ? req.body.reg_date[0] : req.body.reg_date
    };

    const result = await naukriService.insert(data);
    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}

/**
 * POST /api/naukri/update
 * Update an existing Naukri record (with optional image upload)
 */
async function update(req, res) {
  try {
    const data = {
      companyid: req.body.companyid,
      companyname: req.body.companyname,
      company_regpass: req.body.company_regpass,
      company_regemail: req.body.company_regemail,
      notes: req.body.notes,
      image: req.file ? req.file.buffer : null,
      reg_date: req.body.reg_date
    };

    const result = await naukriService.update(data);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/naukri/delete
 * Delete a Naukri record
 */
async function remove(req, res) {
  try {
    const id = req.body.id;
    const result = await naukriService.remove(id);
    res.send('Deleted');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Multer upload middleware for single file
 */
const uploadMiddleware = upload.single('image');

module.exports = {
  getAll,
  getById,
  insert,
  update,
  remove,
  uploadMiddleware
};