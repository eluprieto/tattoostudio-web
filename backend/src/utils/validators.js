/* ── Reutilizable validators para express-validator ─────────────── */
const { body } = require('express-validator');

const emailValidator = body('email')
  .isEmail().withMessage('Email inválido.')
  .normalizeEmail();

const passwordValidator = body('password')
  .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.')
  .matches(/\d/).withMessage('Debe contener al menos un número.');

const nameValidator = body('name')
  .trim()
  .notEmpty().withMessage('El nombre es requerido.')
  .isLength({ max: 80 }).withMessage('Máximo 80 caracteres.');

const priceValidator = body('price')
  .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo.');

const stockValidator = body('stock')
  .isInt({ min: 0 }).withMessage('El stock debe ser un entero no negativo.');

module.exports = { emailValidator, passwordValidator, nameValidator, priceValidator, stockValidator };
