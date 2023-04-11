/** @format */

const { Good } = require("../schemas/goods.schema");

async function addGoods(req, res, next) {
  console.log("req.body", req.body);
  try {
    const { goods } = req.body;
    await Good.insertMany(source);
    return res.json(`${goods.length} goods added`);
  } catch (error) {
    return res.json(error);
  }
}

async function getGoods(req, res, next) {
  try {
    const list = await Good.find({});
    return res.json(list);
  } catch (error) {
    return res.json(error.message);
  }
}

async function addOneGood(req, res, next) {
  const {
    formData: { describe, img, usage, title, price, quantity, volume },
  } = req.body;
  try {
    const list = await Good.create([{
      describe,
      img,
      usage,
      title,
      price,
      quantity,
      volume,
    }]);
    console.log('list', list)
    return res.json(list);
  } catch (error) {
    return res.json(error.message);
  }
}

module.exports = {
  addGoods,
  getGoods,
  addOneGood,
};
