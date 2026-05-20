const winston = require('winston');
const path    = require('path');

/* ── Logger ─────────────────────────────────────────────────────── */
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack }) =>
      `${timestamp} [${level.toUpperCase()}] ${stack || message}`
    )
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 3
    })
  ]
});

/* ── Sanitize string (strip HTML) ───────────────────────────────── */
function sanitizeString(str) {
  return String(str).replace(/<[^>]*>/g, '').trim();
}

/* ── Format price ARS ───────────────────────────────────────────── */
function formatPrice(amount) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0
  }).format(amount);
}

/* ── Generate random token ──────────────────────────────────────── */
function randomToken(bytes = 32) {
  return require('crypto').randomBytes(bytes).toString('hex');
}

module.exports = { logger, sanitizeString, formatPrice, randomToken };
