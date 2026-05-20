const express = require('express');
const { body, query, validationResult } = require('express-validator');

const Product      = require('../models/Product');
const authMiddleware = require('../middleware/auth');
const adminGuard     = require('../middleware/auth').adminGuard;
const logger         = require('../utils/helpers').logger;

const router = express.Router();

/* ── GET /api/products ──────────────────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const { category, bodyPart, material, search, sort, limit = 50, page = 1 } = req.query;

    const filter = { active: true };
    if (category) filter.category = category;
    if (bodyPart) filter.bodyPart = bodyPart;
    if (material) filter.material = material;
    if (search)   filter.$text = { $search: search };

    let sortObj = {};
    switch (sort) {
      case 'price-asc':  sortObj = { price:  1 }; break;
      case 'price-desc': sortObj = { price: -1 }; break;
      case 'newest':     sortObj = { createdAt: -1 }; break;
      default:           sortObj = { popular: -1, createdAt: -1 };
    }

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ products, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    logger.error('Get products error:', err);
    res.status(500).json({ message: 'Error al obtener productos.' });
  }
});

/* ── GET /api/products/:id ──────────────────────────────────────── */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, active: true });
    if (!product) return res.status(404).json({ message: 'Producto no encontrado.' });
    res.json({ product });
  } catch {
    res.status(404).json({ message: 'Producto no encontrado.' });
  }
});

/* ── POST /api/products (admin) ─────────────────────────────────── */
router.post('/',
  authMiddleware, adminGuard,
  [
    body('name').trim().notEmpty(),
    body('category').isIn(['aritos', 'piercings', 'expansores', 'retenciones', 'otros']),
    body('price').isFloat({ min: 0 }),
    body('stock').isInt({ min: 0 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    try {
      const product = await Product.create(req.body);
      res.status(201).json({ product });
    } catch (err) {
      logger.error('Create product error:', err);
      res.status(500).json({ message: 'Error al crear el producto.' });
    }
  }
);

/* ── PUT /api/products/:id (admin) ──────────────────────────────── */
router.put('/:id', authMiddleware, adminGuard, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Producto no encontrado.' });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar el producto.' });
  }
});

/* ── DELETE /api/products/:id (admin) ───────────────────────────── */
router.delete('/:id', authMiddleware, adminGuard, async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { active: false });
    res.json({ message: 'Producto desactivado.' });
  } catch {
    res.status(500).json({ message: 'Error al eliminar el producto.' });
  }
});

module.exports = router;
