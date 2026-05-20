/* ================================================================
   TATTOOSTUDIO – SERVER ENTRY POINT
   ================================================================ */
require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const morgan     = require('morgan');
const mongoose   = require('mongoose');
const path       = require('path');

const authRoutes     = require('./src/routes/auth');
const productRoutes  = require('./src/routes/products');
const orderRoutes    = require('./src/routes/orders');
const paymentRoutes  = require('./src/routes/payments');
const { globalRateLimiter } = require('./src/middleware/rateLimiter');
const errorHandler   = require('./src/middleware/errorHandler');
const logger         = require('./src/utils/helpers').logger;

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── CORS ───────────────────────────────────────────────────────── */
const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, curl, same-origin)
    if (!origin) return callback(null, true);
    // In development allow anything on localhost / 127.0.0.1 / file://
    if (isDev) {
      if (
        origin === 'null' ||                          // file://
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) return callback(null, true);
    }
    // Always allow the configured production URL
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin "${origin}" not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // handle pre-flight for all routes

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(globalRateLimiter);

/* ── Serve static frontend (optional, for production) ───────────── */
app.use(express.static(path.join(__dirname, '../frontend')));

/* ── Routes ─────────────────────────────────────────────────────── */
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/payments', paymentRoutes);

/* ── Shipping config endpoint (leído por el frontend) ───────────── */
app.get('/api/config/shipping', (req, res) => {
  res.json({
    shippingCost:    parseInt(process.env.SHIPPING_COST    || '1500', 10),
    freeShippingFrom: parseInt(process.env.FREE_SHIPPING_FROM || '15000', 10)
  });
});

/* ── Contact form endpoint ──────────────────────────────────────── */
app.post('/api/contact', async (req, res) => {
  const { name, email, service, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Campos requeridos incompletos.' });
  }
  try {
    const emailService = require('./src/services/emailService');
    await emailService.sendContactEmail({ name, email, service, message });
    res.json({ message: 'Mensaje enviado correctamente.' });
  } catch (err) {
    logger.error('Contact email error:', err);
    res.status(500).json({ message: 'No se pudo enviar el mensaje.' });
  }
});

/* ── Health check ───────────────────────────────────────────────── */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV, ts: new Date().toISOString() });
});

/* ── SPA fallback (sirve index.html para rutas del frontend) ─────── */
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  } else {
    res.status(404).json({ message: 'Ruta no encontrada.' });
  }
});

/* ── Error handler ──────────────────────────────────────────────── */
app.use(errorHandler);

/* ── DB + Server start ──────────────────────────────────────────── */
async function start() {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      logger.info('MongoDB conectado.');
    } else {
      logger.warn('MONGODB_URI no definido – corriendo sin base de datos (modo demo).');
    }

    app.listen(PORT, () => {
      logger.info(`TattooStudio API corriendo en http://localhost:${PORT}`);
      logger.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    logger.error('Error al iniciar el servidor:', err);
    process.exit(1);
  }
}

start();

module.exports = app;
