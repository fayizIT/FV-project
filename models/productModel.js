const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  item: {
    type: String,
    require: true,
  },
  productname: {
    type: String,
    require: true,
  },
  category: {
    type: String,

    require: true,
  },
  price: {
    type: Number,
    require: true,
  },

  inStock: {
    type: Number,
    require: true,
  },
  images: { type: [String], 
    require: true },

  description: {
    type: String,
    required: true,
  },
  
  unlist: {
    type: Boolean,
    default: false,
  },
});

const Products = mongoose.model("Product", productSchema);

module.exports = Products;