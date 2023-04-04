/** @format */

const { Good } = require("../schemas/goods.schema");

async function addGoods(req, res, next) {
    try {
        const { goods } = req.body;
        await Good.create(goods);
        return res.json(`${goods.length} goods added`);
    } catch (error) {
        return res.json(error.message)
    }
}

async function getGoods(req, res, next) {
    try {
        const list = await Good.find({})
        return res.json(list)
        
    } catch (error) {
        return res.json(error.message)
        
    }
}

module.exports = {
  addGoods,
  getGoods,
};