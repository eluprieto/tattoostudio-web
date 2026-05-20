const express = require('express');
const Order        = require('../models/Order');
const authMiddleware = require('../middleware/auth');
const logger         = require('../utils/helpers').logger;

const router = express.Router();

/* ── GET /api/orders/mine ───────────────────────────────────────── */
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener pedidos.' });
  }
});

/* ── GET /api/orders/:id ────────────────────────────────────────── */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Pedido no encontrado.' });

    // User can only see their own orders (admin can see all)
    if (req.user.role !== 'admin' && order.user?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'No autorizado.' });
    }
    res.json({ order });
  } catch {
    res.status(404).json({ message: 'Pedido no encontrado.' });
  }
});

/* ── GET /api/orders (admin) ────────────────────────────────────── */
router.get('/', authMiddleware, require('../middleware/auth').adminGuard, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Order.countDocuments(filter);
    res.json({ orders, total });
  } catch (err) {
    logger.error('Get orders error:', err);
    res.status(500).json({ message: 'Error al obtener pedidos.' });
  }
});

module.exports = router;
