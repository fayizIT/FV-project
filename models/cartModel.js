


const mongoose = require('mongoose');

const Schema = mongoose.Schema
const cartSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
  products: [
    {
        productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Product"
      },
      kg: {
             type: Number,
             default: 1,
              required: true
      },
      total:{
        type:Number,
        default:0
      }
    }
  ]
  

});

module.exports = mongoose.model('Cart', cartSchema);