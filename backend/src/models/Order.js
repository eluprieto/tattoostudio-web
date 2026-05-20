const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productId:  Number,
  name:       String,
  price:      Number,
  quantity:   Number,
  image:      String
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestEmail: String,

  items: [orderItemSchema],

  buyer: {
    firstName: String,
    lastName:  String,
    email:     { type: String, required: true },
    phone:     String
  },

  shipping: {
    address:  String,
    city:     String,
    province: String,
    zipCode:  String,
    notes:    String,
    cost:     { type: Number, default: 0 }
  },

  subtotal: { type: Number, required: true },
  total:    { type: Number, required: true },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'in_process', 'refunded', 'cancelled'],
    default: 'pending'
  },

  payment: {
    preferenceId: String,
    paymentId:    String,
    method:       String,
    status:       String,
    statusDetail: String
  }

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
