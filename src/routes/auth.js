const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readData, writeData, nextId } = require('../db/database');
const { env } = require('../config/env');

const router = express.Router();

function signUser(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name || '' },
    env.jwtSecret,
    { expiresIn: '7d' }
  );
}

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  const data = readData();
  const normalizedEmail = email.toLowerCase();
  const existing = data.users.find((user) => user.email === normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: 'Email already exists' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const user = {
    id: nextId(data, 'users'),
    name,
    email: normalizedEmail,
    password_hash: passwordHash,
    created_at: new Date().toISOString()
  };
  data.users.push(user);
  writeData(data);
  const token = signUser(user);

  return res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const data = readData();
  const user = data.users.find((entry) => entry.email === email.toLowerCase());
  if (!user || !user.password_hash || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = signUser(user);
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

module.exports = router;
