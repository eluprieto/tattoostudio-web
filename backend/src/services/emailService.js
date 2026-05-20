/* ================================================================
   TATTOOSTUDIO – EMAIL SERVICE (Nodemailer)
   ================================================================ */
const nodemailer = require('nodemailer');
const logger     = require('../utils/helpers').logger;

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host:   process.env.EMAIL_HOST  || 'smtp.gmail.com',
      port:   parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  return transporter;
}

/* ── Plantilla base HTML ──────────────────────────────────────────── */
function baseTemplate(content) {
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head><meta charset="UTF-8"/><style>
    body{background:#0a0a0a;font-family:Georgia,serif;color:#f5f0e8;margin:0;padding:0}
    .wrap{max-width:600px;margin:auto;background:#111;border:1px solid #3a2f1e;padding:2rem}
    h1,h2{color:#c9a84c;font-family:Georgia,serif}
    p{color:#a89880;line-height:1.7}
    .amount{color:#c9a84c;font-size:1.4em;font-weight:bold}
    table{width:100%;border-collapse:collapse;margin:1rem 0}
    th{background:#1a1510;color:#c9a84c;padding:.5rem;text-align:left;font-size:.8rem;letter-spacing:.1em;text-transform:uppercase}
    td{padding:.5rem;border-bottom:1px solid #3a2f1e;color:#a89880;font-size:.9rem}
    .footer{margin-top:1.5rem;padding-top:1rem;border-top:1px solid #3a2f1e;font-size:.8rem;color:#6b5a48;text-align:center}
    a{color:#c9a84c}
  </style></head>
  <body><div class="wrap">${content}<div class="footer">TattooStudio · Buenos Aires · info@tattoostudio.com</div></div></body>
  </html>`;
}

const emailService = {
  /* Confirmación de compra al cliente */
  async sendOrderConfirmation(order) {
    if (!process.env.EMAIL_USER) { logger.warn('Email no configurado – omitiendo confirmación de pedido.'); return; }

    const itemsHtml = order.items.map(i =>
      `<tr><td>${i.name}</td><td>${i.quantity}</td><td>$${(i.price * i.quantity).toLocaleString('es-AR')}</td></tr>`
    ).join('');

    const html = baseTemplate(`
      <h1>¡Gracias por tu compra!</h1>
      <p>Hola <strong style="color:#f5f0e8">${order.buyer.firstName}</strong>, tu pedido fue recibido y está siendo procesado.</p>
      <h2>Detalle del pedido</h2>
      <table>
        <tr><th>Producto</th><th>Cant.</th><th>Total</th></tr>
        ${itemsHtml}
        <tr><td colspan="2"><strong>Envío</strong></td><td>$${(order.shipping?.cost || 0).toLocaleString('es-AR')}</td></tr>
      </table>
      <p class="amount">Total: $${order.total.toLocaleString('es-AR')}</p>
      <p>Enviaremos tu pedido a: <strong style="color:#f5f0e8">${order.shipping?.address}, ${order.shipping?.city}, ${order.shipping?.province}</strong></p>
      <p>Ante cualquier duda escribinos a <a href="mailto:info@tattoostudio.com">info@tattoostudio.com</a> o por WhatsApp.</p>
    `);

    await getTransporter().sendMail({
      from:    `"TattooStudio" <${process.env.EMAIL_USER}>`,
      to:      order.buyer.email,
      subject: `✅ Pedido confirmado – TattooStudio`,
      html
    });
  },

  /* Aviso de nuevo pedido al dueño */
  async sendNewOrderAlert(order) {
    if (!process.env.OWNER_EMAIL || !process.env.EMAIL_USER) return;

    const itemsHtml = order.items.map(i =>
      `<tr><td>${i.name}</td><td>${i.quantity}</td><td>$${(i.price * i.quantity).toLocaleString('es-AR')}</td></tr>`
    ).join('');

    const html = baseTemplate(`
      <h1>🛍 Nuevo pedido recibido</h1>
      <p><strong style="color:#f5f0e8">Cliente:</strong> ${order.buyer.firstName} ${order.buyer.lastName} (${order.buyer.email})</p>
      <p><strong style="color:#f5f0e8">Teléfono:</strong> ${order.buyer.phone || '–'}</p>
      <table>
        <tr><th>Producto</th><th>Cant.</th><th>Total</th></tr>
        ${itemsHtml}
      </table>
      <p class="amount">Total a cobrar: $${order.total.toLocaleString('es-AR')}</p>
      <p><strong style="color:#f5f0e8">Enviar a:</strong><br/>
        ${order.shipping?.address}<br/>
        ${order.shipping?.city}, ${order.shipping?.province} (CP: ${order.shipping?.zipCode})<br/>
        ${order.shipping?.notes ? `Nota: ${order.shipping.notes}` : ''}
      </p>
    `);

    await getTransporter().sendMail({
      from:    `"TattooStudio Sistema" <${process.env.EMAIL_USER}>`,
      to:      process.env.OWNER_EMAIL,
      subject: `🛍 Nuevo pedido – $${order.total.toLocaleString('es-AR')}`,
      html
    });
  },

  /* Reset de contraseña */
  async sendPasswordResetEmail(email, resetUrl) {
    if (!process.env.EMAIL_USER) return;

    const html = baseTemplate(`
      <h1>Recuperar contraseña</h1>
      <p>Recibiste este email porque solicitaste restablecer tu contraseña en TattooStudio.</p>
      <p style="margin:2rem 0">
        <a href="${resetUrl}" style="background:#c9a84c;color:#0a0a0a;padding:.85rem 2rem;text-decoration:none;font-weight:bold;border-radius:4px">
          Restablecer contraseña
        </a>
      </p>
      <p>Este enlace expira en <strong>1 hora</strong>. Si no solicitaste este cambio, ignorá este email.</p>
    `);

    await getTransporter().sendMail({
      from:    `"TattooStudio" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: 'Recuperar contraseña – TattooStudio',
      html
    });
  },

  /* Formulario de contacto */
  async sendContactEmail({ name, email, service, message }) {
    if (!process.env.OWNER_EMAIL || !process.env.EMAIL_USER) return;

    const html = baseTemplate(`
      <h1>Nuevo mensaje de contacto</h1>
      <p><strong style="color:#f5f0e8">Nombre:</strong> ${name}</p>
      <p><strong style="color:#f5f0e8">Email:</strong> <a href="mailto:${email}">${email}</a></p>
      <p><strong style="color:#f5f0e8">Servicio de interés:</strong> ${service || '–'}</p>
      <p><strong style="color:#f5f0e8">Mensaje:</strong><br/>${message}</p>
    `);

    await getTransporter().sendMail({
      from:    `"TattooStudio Web" <${process.env.EMAIL_USER}>`,
      to:      process.env.OWNER_EMAIL,
      replyTo: email,
      subject: `📩 Consulta web de ${name}`,
      html
    });
  }
};

module.exports = emailService;
