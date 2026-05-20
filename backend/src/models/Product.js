const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  category:  { type: String, required: true, enum: ['aritos', 'piercings', 'expansores', 'retenciones', 'otros'] },
  bodyPart:  { type: String, enum: ['oreja', 'nariz', 'labio', 'ceja', 'ombligo', 'lengua', 'otro'] },
  material:  { type: String, enum: ['acero', 'titanio', 'oro', 'plata', 'negro', 'multicolor', 'otro'] },
  price:     { type: Number, required: true, min: 0 },
  stock:     { type: Number, required: true, default: 0, min: 0 },
  image:     { type: String, default: '' },
  images:    [String],
  desc:      { type: String, default: '' },
  popular:   { type: Boolean, default: false },
  active:    { type: Boolean, default: true }
}, { timestamps: true });

productSchema.index({ name: 'text', desc: 'text' });
productSchema.index({ category: 1, bodyPart: 1, material: 1 });

module.exports = mongoose.model('Product', productSchema);
