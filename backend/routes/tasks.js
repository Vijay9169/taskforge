import express from 'express';
import Task from '../models/Task.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all tasks
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create Task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, priority, status, dueDate } = req.body;
    const task = new Task({
      title,
      description,
      priority,
      status: status || 'todo',
      dueDate: dueDate || null,
      user: req.user.id,
    });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update Task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const updates = { ...req.body };

    if (req.body.status) {
      if (req.body.status === 'in-progress' && !task.startedAt) {
        updates.startedAt = new Date();
      } else if (req.body.status === 'done') {
        if (!task.startedAt) updates.startedAt = task.createdAt;
        updates.completedAt = new Date();
      } else if (req.body.status === 'todo') {
        updates.completedAt = null;
      }
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: updates },
      { new: true }
    );

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete Task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;