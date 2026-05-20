const rateLimit = require('express-rate-limit');

/* Limitador general */
const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiadas solicitudes. Intentá en unos minutos.' }
});

/* Limitador para auth (más estricto) */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Demasiados intentos. Esperá 15 minutos.' }
});

/* Limitador para pagos */
const paymentRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { message: 'Demasiadas solicitudes de pago. Esperá un momento.' }
});

module.exports = { globalRateLimiter, authRateLimiter, paymentRateLimiter };
