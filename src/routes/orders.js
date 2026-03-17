const express = require('express');
const { readData, writeData, nextId } = require('../db/database');

const router = express.Router();

router.post('/', (req, res) => {
  const { customer, items, subtotal, total, payment } = req.body || {};

  if (!customer || !customer.firstName || !customer.lastName || !customer.email) {
    return res.status(400).json({ error: 'Customer details are required' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order items are required' });
  }

  const data = readData();
  const orderId = nextId(data, 'orders');
  data.orders.push({
    id: orderId,
    customer_name: `${customer.firstName} ${customer.lastName}`.trim(),
    customer_email: customer.email,
    customer_phone: customer.phone || '',
    address: `${customer.street || ''}, ${customer.city || ''}, ${customer.state || ''}, ${customer.country || ''}, ${customer.zipCode || ''}`,
    items,
    subtotal: Number(subtotal || 0),
    total: Number(total || 0),
    payment_last4: payment && payment.cardNumber ? String(payment.cardNumber).slice(-4) : '',
    created_at: new Date().toISOString()
  });
  writeData(data);

  return res.status(201).json({
    message: 'Order placed successfully',
    orderId
  });
});

module.exports = router;
