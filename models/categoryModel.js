const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const categorySchema = new mongoose.Schema({
  category: {
    type: String,
    require: true,
  },
  products: {
    type: Array,
  },
  unlist: {
    type: Boolean,
    default: false,
  },
});
module.exports = mongoose.model("Category", categorySchema);