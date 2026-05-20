/* ================================================================
   TATTOOSTUDIO – MERCADO PAGO SERVICE
   SDK v2 oficial de MercadoPago para Node.js
   ================================================================ */
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

let client;

function getClient() {
  if (!client) {
    if (!process.env.MP_ACCESS_TOKEN) {
      throw new Error('MP_ACCESS_TOKEN no está configurado en .env');
    }
    client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
      options: { timeout: 5000 }
    });
  }
  return client;
}

const mpService = {
  /* Crear preferencia de pago */
  async createPreference({ items, payer, shipmentCost = 0, orderId }) {
    const preference = new Preference(getClient());

    const frontendUrl  = process.env.FRONTEND_URL || '';
    const isProd       = frontendUrl.startsWith('https://');

    // MP requires public HTTPS URLs for back_urls + auto_return.
    // In dev (localhost / http://), use placeholder HTTPS URLs so the preference
    // is accepted; auto_return is omitted so MP won't try to redirect automatically.
    const backUrls = isProd
      ? {
          success: `${frontendUrl}/api/payments/success`,
          failure: `${frontendUrl}/pages/payment-failure.html`,
          pending: `${frontendUrl}/pages/payment-failure.html`
        }
      : {
          success: 'https://tattoostudio.com.ar/pago-exitoso',
          failure: 'https://tattoostudio.com.ar/pago-fallido',
          pending: 'https://tattoostudio.com.ar/pago-pendiente'
        };

    const body = {
      items,
      payer,
      back_urls:          backUrls,
      external_reference: orderId || '',
      statement_descriptor: 'TattooStudio',
      expires: false
    };

    // auto_return only works with verified HTTPS back_urls
    if (isProd) {
      body.auto_return = 'approved';
    }

    // notification_url must also be public — skip in dev
    if (isProd) {
      body.notification_url = `${frontendUrl}/api/payments/webhook`;
    }

    if (shipmentCost > 0) {
      body.shipments = { cost: shipmentCost, mode: 'not_specified' };
    }

    const result = await preference.create({ body });
    return result;
  },

  /* Obtener datos de un pago (para webhook) */
  async getPayment(paymentId) {
    const payment = new Payment(getClient());
    const result  = await payment.get({ id: paymentId });
    return result;
  }
};

module.exports = mpService;
