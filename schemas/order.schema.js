/** @format */

const { Schema, model } = require("mongoose");

const OrdersGoodSchema = new Schema({
  price: {
    type: Number,
    required: [true, "Price is required"],
  },
  volume: {
    type: Number,
    required: [true, "Volume is required"],
  },
  quantity: {
    type: Number,
    default: 1,
    required: [true, "Quantity is required"],
  },
});

const OrderSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  phone: {
    type: Number,
    required: [true, "Phone is required"],
    minLength: 10,
    maxLength: 13,
  },
  order: [OrdersGoodSchema],
  //date: new Date(),
});

const Order = model("orders", OrderSchema);

module.exports = {
  Order,
};
