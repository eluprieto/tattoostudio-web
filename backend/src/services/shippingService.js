/* ================================================================
   TATTOOSTUDIO – SHIPPING SERVICE
   MVP: costo de envío configurable manualmente desde .env
   ================================================================ */

const shippingService = {
  /* Calcular costo según subtotal */
  calculate(subtotal) {
    const cost     = parseInt(process.env.SHIPPING_COST     || '1500', 10);
    const freeFrom = parseInt(process.env.FREE_SHIPPING_FROM || '15000', 10);

    if (subtotal >= freeFrom) {
      return { cost: 0, label: 'Envío gratis', free: true };
    }
    return {
      cost,
      label: `Correo Argentino – $${cost.toLocaleString('es-AR')}`,
      free: false,
      estimatedDays: '3–7 días hábiles'
    };
  },

  /* Retornar opciones disponibles */
  getOptions(subtotal) {
    const standard = this.calculate(subtotal);
    return [
      {
        id:    'correo_argentino',
        name:  'Correo Argentino',
        ...standard,
        note: 'Se enviará número de seguimiento por email.'
      }
    ];
  }
};

module.exports = shippingService;
