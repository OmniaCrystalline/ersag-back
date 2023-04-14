/** @format */

const { Schema, model } = require("mongoose");

const GoodSchema = new Schema({
  title: {
    type: String,
    required: [true, "Title name is required"],
  },
  describe: {
    type: String,
    required: [true, "Description is required"],
  },
  usage: {
    type: String,
    required: [true, "Usage is required"],
  },
  img: {
    type: String,
    required: [true, "Img link is required"],
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
  },
  type: {
    type: String,
    required: [true, "Type beauty or clean is required"],
    enum: ["beauty", "clean"],
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

//The mongoose.model() function of the mongoose module is used to create a collection of a particular database of MongoDB.

const Good = model("goods", GoodSchema);

module.exports = {
  Good,
  GoodSchema,
};
