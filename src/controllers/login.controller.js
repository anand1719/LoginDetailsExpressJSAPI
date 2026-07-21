const loginService = require('../services/login.service');
const { encrypt, decrypt } = require('../utils/encryption');

/**
 * GET /api/login
 * Get all login details
 */
async function getAll(req, res) {
  try {
    const username = req.query.username || '';
    const result = await loginService.getAll(username);
    res.setHeader('Content-Type', 'application/xml');
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/login/ordered
 * Get all login details ordered by id descending
 */
async function getAllOrdered(req, res) {
  try {
    const result = await loginService.getAllOrdered();
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/login/search
 * Search login details
 */
async function search(req, res) {
  try {
    const data = req.body.search;
    const username = req.body.username || '';
    const result = await loginService.search(data, username);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/login/get-by-id
 * Get login detail by ID with decrypted password
 */
async function getById(req, res) {
  try {
    const data = req.body.Id;
    const username = req.body.username || '';
    const result = await loginService.getById(data, username);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/login/insert
 * Insert a new login record
 */
async function insert(req, res) {
  try {
    const result = await loginService.insert(req.body);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/login/update
 * Update an existing login record
 */
async function update(req, res) {
  try {
    const result = await loginService.update(req.body);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/login/delete
 * Delete a login record
 */
async function remove(req, res) {
  try {
    const id = req.body.Id;
    const login_notes = req.body.login_notes || '';
    const username = req.body.username || '';
    const result = await loginService.remove(id, login_notes, username);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/login/by-param/:id
 * Get login by URL parameter ID
 */
async function getByParamId(req, res) {
  try {
    const id = req.params.id;
    const result = await loginService.getByParamId(id);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/login/decrypt
 * Decrypt a password
 */
async function decryptPassword(req, res) {
  try {
    const data = req.body.password;
    const val = decrypt(data);
    res.send({ password: val });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/login/encrypt/:input
 * Encrypt a value
 */
async function encryptInput(req, res) {
  try {
    const input = req.params.input;
    res.send(Buffer.from(input).toString('base64'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getAll,
  getAllOrdered,
  search,
  getById,
  insert,
  update,
  remove,
  getByParamId,
  decryptPassword,
  encryptInput
};