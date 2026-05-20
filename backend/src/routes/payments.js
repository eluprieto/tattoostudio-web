const express = require('express');
const mpService   = require('../services/mercadopagoService');
const emailService = require('../services/emailService');
const Order        = require('../models/Order');
const Product      = require('../models/Product');
const logger       = require('../utils/helpers').logger;

const router = express.Router();

/* ── POST /api/payments/create-preference ───────────────────────── */
router.post('/create-preference', async (req, res) => {
  if (!process.env.MP_ACCESS_TOKEN) {
    logger.error('MP_ACCESS_TOKEN no está configurado en .env');
    return res.status(503).json({
      message: 'Pagos no disponibles: falta configurar MP_ACCESS_TOKEN en el servidor.'
    });
  }

  const { items, buyer, shipping } = req.body;

  if (!items?.length || !buyer?.email) {
    return res.status(400).json({ message: 'Datos del pedido incompletos.' });
  }

  try {
    const subtotal   = items.reduce((acc, i) => acc + (i.unit_price * i.quantity), 0);
    const shipCost   = shipping?.cost || parseInt(process.env.SHIPPING_COST || '1500', 10);
    const freeFrom   = parseInt(process.env.FREE_SHIPPING_FROM || '15000', 10);
    const finalShip  = subtotal >= freeFrom ? 0 : shipCost;
    const total      = subtotal + finalShip;

    // Save order as pending
    const order = await Order.create({
      items: items.map(i => ({
        productId: i.id,
        name:      i.name,
        price:     i.unit_price,
        quantity:  i.quantity
      })),
      buyer: {
        firstName: buyer.firstName,
        lastName:  buyer.lastName,
        email:     buyer.email,
        phone:     buyer.phone
      },
      shipping: {
        address:  buyer.address,
        city:     buyer.city,
        province: buyer.province,
        zipCode:  buyer.zipCode,
        notes:    buyer.notes,
        cost:     finalShip
      },
      subtotal,
      total,
      status: 'pending'
    }).catch(() => null); // If no MongoDB, continue anyway

    // Create MercadoPago preference
    const preference = await mpService.createPreference({
      items: items.map(i => ({
        id:          String(i.id),
        title:       i.name,
        quantity:    i.quantity,
        unit_price:  i.unit_price,
        currency_id: 'ARS'
      })),
      payer: { email: buyer.email, name: `${buyer.firstName} ${buyer.lastName}` },
      shipmentCost: finalShip,
      orderId:      order?._id?.toString()
    });

    // Save preference ID to order
    if (order) {
      order.payment = { preferenceId: preference.id };
      await order.save().catch(() => {});
    }

    res.json({ init_point: preference.init_point, preference_id: preference.id });
  } catch (err) {
    logger.error('Create preference error:', err);
    res.status(500).json({ message: 'No se pudo iniciar el pago. Intentá más tarde.' });
  }
});

/* ── POST /api/payments/webhook ─────────────────────────────────── */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const body = req.body;
  const type = req.query.type || body?.type;

  // Acknowledge immediately – MP expects fast response
  res.status(200).send('OK');

  if (type !== 'payment') return;

  const paymentId = body?.data?.id || req.query['data.id'];
  if (!paymentId) return;

  try {
    const paymentData = await mpService.getPayment(paymentId);
    const { status, status_detail, external_reference } = paymentData;

    if (!external_reference) return;

    const order = await Order.findById(external_reference);
    if (!order) return;

    order.payment.paymentId    = String(paymentId);
    order.payment.status       = status;
    order.payment.statusDetail = status_detail;

    if (status === 'approved') {
      order.status = 'approved';

      // Decrease stock
      for (const item of order.items) {
        if (item.productId) {
          await Product.findOneAndUpdate(
            { _id: item.productId },
            { $inc: { stock: -item.quantity } }
          ).catch(() => {});
        }
      }

      // Email to buyer
      await emailService.sendOrderConfirmation(order).catch(e => logger.error('Email buyer error:', e));
      // Email to owner
      await emailService.sendNewOrderAlert(order).catch(e => logger.error('Email owner error:', e));
    } else if (['rejected', 'cancelled'].includes(status)) {
      order.status = status;
    }

    await order.save();
    logger.info(`Payment webhook: order ${order._id} → ${status}`);
  } catch (err) {
    logger.error('Webhook processing error:', err);
  }
});

/* ── GET /api/payments/success ──────────────────────────────────── */
router.get('/success', (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/pages/payment-success.html?payment_id=${req.query.payment_id || ''}`);
});

module.exports = router;
