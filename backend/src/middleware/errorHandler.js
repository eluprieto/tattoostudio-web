const logger = require('../utils/helpers').logger;

function errorHandler(err, req, res, next) {
  logger.error(`[${req.method}] ${req.path} – ${err.message}`, { stack: err.stack });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: messages[0] });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ message: `Ya existe un registro con ese ${field}.` });
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Token inválido.' });
  }

  // Default
  const status  = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : 'Error interno del servidor.';
  res.status(status).json({ message });
}

module.exports = errorHandler;
