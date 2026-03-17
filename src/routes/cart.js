const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../db/database');

const router = express.Router();

router.post('/sync', (req, res) => {
  const payload = req.body || {};
  const items = Array.isArray(payload.items) ? payload.items : [];
  const cartId = payload.cartId || uuidv4();

  const data = readData();
  let cart = data.carts.find((entry) => entry.cartId === cartId);

  if (!cart) {
    cart = { cartId, items: [], updatedAt: new Date().toISOString() };
    data.carts.push(cart);
  }

  cart.items = items
    .filter((item) => item && item.name)
    .map((item) => ({
      name: String(item.name),
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1),
      image: item.image ? String(item.image) : null
    }));
  cart.updatedAt = new Date().toISOString();
  writeData(data);

  return res.json({ cartId, message: 'Cart synchronized' });
});

router.get('/:cartId', (req, res) => {
  const { cartId } = req.params;
  const data = readData();
  const cart = data.carts.find((entry) => entry.cartId === cartId);

  if (!cart) {
    return res.json({ cartId, items: [] });
  }

  return res.json({ cartId, items: cart.items || [] });
});

module.exports = router;
