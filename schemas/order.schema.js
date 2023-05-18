/** @format */

const { any, date } = require("joi");
const { Schema, model } = require("mongoose");

const OrdersGoodSchema = new Schema({
  
  title: {
    type: String,
    required: [true, 'title is required'],
  },
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
  active: {
    type: Boolean,
    required: [true, 'Order status required']
  },
  order: [OrdersGoodSchema],
  date: {
    type: date,
    required: [true, 'date is required']
  }
});

const Order = model("orders", OrderSchema);

module.exports = {
  Order,
};
