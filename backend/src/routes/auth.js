const express = require('express');
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');
const { body, validationResult } = require('express-validator');

const User         = require('../models/User');
const authMiddleware = require('../middleware/auth');
const emailService   = require('../services/emailService');
const { authRateLimiter } = require('../middleware/rateLimiter');
const logger           = require('../utils/helpers').logger;

const router = express.Router();

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

/* ── POST /api/auth/register ────────────────────────────────────── */
router.post('/register',
  authRateLimiter,
  [
    body('name').trim().notEmpty().withMessage('El nombre es requerido.').isLength({ max: 80 }),
    body('email').isEmail().normalizeEmail().withMessage('Email inválido.'),
    body('password').isLength({ min: 6 }).withMessage('Mínimo 6 caracteres.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { name, email, password, acceptsOffers } = req.body;

    try {
      if (await User.findOne({ email })) {
        return res.status(409).json({ message: 'Ya existe una cuenta con ese email.' });
      }

      const user  = await User.create({ name, email, password, acceptsOffers: !!acceptsOffers });
      const token = signToken(user._id);

      res.status(201).json({ token, user });
    } catch (err) {
      logger.error('Register error:', err);
      res.status(500).json({ message: 'Error al crear la cuenta.' });
    }
  }
);

/* ── POST /api/auth/login ───────────────────────────────────────── */
router.post('/login',
  authRateLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Datos inválidos.' });

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Email o contraseña incorrectos.' });
      }

      const token = signToken(user._id);
      const safe  = user.toJSON();
      res.json({ token, user: safe });
    } catch (err) {
      logger.error('Login error:', err);
      res.status(500).json({ message: 'Error al iniciar sesión.' });
    }
  }
);

/* ── GET /api/auth/me ───────────────────────────────────────────── */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener perfil.' });
  }
});

/* ── POST /api/auth/forgot-password ────────────────────────────── */
router.post('/forgot-password', authRateLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email requerido.' });

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always respond OK to prevent user enumeration
    if (!user) return res.json({ message: 'Si el email existe, recibirás un enlace.' });

    const token  = crypto.randomBytes(32).toString('hex');
    user.resetToken       = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hora
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/pages/reset-password.html?token=${token}`;
    await emailService.sendPasswordResetEmail(user.email, resetUrl);

    res.json({ message: 'Si el email existe, recibirás un enlace.' });
  } catch (err) {
    logger.error('Forgot password error:', err);
    res.status(500).json({ message: 'Error al procesar la solicitud.' });
  }
});

/* ── POST /api/auth/reset-password ─────────────────────────────── */
router.post('/reset-password',
  [
    body('token').notEmpty(),
    body('password').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { token, password } = req.body;

    try {
      const user = await User.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() }
      });

      if (!user) return res.status(400).json({ message: 'Token inválido o expirado.' });

      user.password         = password;
      user.resetToken       = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();

      res.json({ message: 'Contraseña actualizada correctamente.' });
    } catch (err) {
      logger.error('Reset password error:', err);
      res.status(500).json({ message: 'Error al actualizar la contraseña.' });
    }
  }
);

/* ── PUT /api/auth/update-profile ───────────────────────────────── */
router.put('/update-profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, address },
      { new: true, runValidators: true }
    );
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar el perfil.' });
  }
});

module.exports = router;
