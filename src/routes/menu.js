const express = require('express');
const { menuItems } = require('../config/menuData');

const router = express.Router();

router.get('/', (req, res) => {
  const query = String(req.query.q || '').trim().toLowerCase();

  if (!query) {
    return res.json({ items: menuItems });
  }

  const filtered = menuItems.filter(
    (item) => item.name.toLowerCase().includes(query) || item.category.toLowerCase().includes(query)
  );

  return res.json({ items: filtered });
});

module.exports = router;
