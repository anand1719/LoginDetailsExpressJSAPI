const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todo.controller');

// GET /api/todo - Get all ToDo items (optionally filter by ?date=)
router.get('/', todoController.getAll);

// POST /api/todo/add - Add a new ToDo item
router.post('/add', todoController.add);

// POST /api/todo/update - Update a ToDo item
router.post('/update', todoController.update);

// POST /api/todo/delete - Delete a ToDo item
router.post('/delete', todoController.remove);

// POST /api/todo/edit - Get a single ToDo item by ID
router.post('/edit', todoController.getById);

module.exports = router;