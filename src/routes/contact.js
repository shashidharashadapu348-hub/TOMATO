const express = require('express');
const { readData, writeData, nextId } = require('../db/database');

const router = express.Router();

router.post('/', (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required' });
  }

  const data = readData();
  data.contacts.push({
    id: nextId(data, 'contacts'),
    name,
    email,
    message,
    created_at: new Date().toISOString()
  });
  writeData(data);

  return res.status(201).json({ message: 'Message received successfully' });
});

module.exports = router;
