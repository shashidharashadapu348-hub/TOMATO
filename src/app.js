const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const indexRoutes = require('./routes/index');
const menuRoutes = require('./routes/menu');
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const contactRoutes = require('./routes/contact');
const ordersRoutes = require('./routes/orders');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const rootDir = path.resolve(__dirname, '..');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('dev'));

app.use(
  express.json({
    limit: '1mb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);

app.use('/api', indexRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/orders', ordersRoutes);

app.use(express.static(rootDir));

app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'Tomato .html'));
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
