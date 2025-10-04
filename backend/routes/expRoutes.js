const express = require('express');
const router = express.Router();
const ExpLog = require('../models/expLogModel');

router.get('/history', async (req, res) => {
  try {
    const logs = await ExpLog.find({ user_id: req.user.id }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch EXP history' });
  }
});

module.exports = router;