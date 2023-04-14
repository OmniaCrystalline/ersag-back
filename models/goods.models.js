/** @format */
const { Good } = require("../schemas/goods.schema");
const formidable = require("formidable");

async function addGoods(req, res, next) {
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
  const form = new formidable.IncomingForm({
    multiples: true,
    uploadDir: "./upload/",
    keepExtensions: true,
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    const newGood = new Good(fields);
    newGood.img = files.file.newFilename;
    newGood.save((err) => {
      if (err) {
        return res.status(400).json({
          mes: res.message
        });
      }
    });
    res.json({ fields, files });
  });
}

module.exports = {
  addGoods,
  getGoods,
  addOneGood,
};
