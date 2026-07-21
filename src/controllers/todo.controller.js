const todoService = require('../services/todo.service');

/**
 * GET /api/todo
 * Get all ToDo items (optionally filtered by date)
 */
async function getAll(req, res) {
  try {
    const selectedToDoDate = req.query.date || null;
    const result = await todoService.getAll(selectedToDoDate);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/todo/add
 * Add a new ToDo item
 */
async function add(req, res) {
  try {
    const result = await todoService.add(req.body);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/todo/update
 * Update an existing ToDo item
 */
async function update(req, res) {
  try {
    const result = await todoService.update(req.body);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/todo/delete
 * Delete a ToDo item
 */
async function remove(req, res) {
  try {
    const id = req.body.id;
    const result = await todoService.remove(id);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/todo/edit
 * Get a single ToDo item by ID
 */
async function getById(req, res) {
  try {
    const id = req.body.id;
    const result = await todoService.getById(id);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getAll,
  add,
  update,
  remove,
  getById
};