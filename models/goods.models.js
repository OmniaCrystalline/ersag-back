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
    const data = await Good.find({});
    return res.json({ data });
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

  form.on("field", (fieldName, fieldValue) => {
    newGood[fieldName] = fieldValue;
  });

  form.on("file", (formname, file) => {
    newGood.img = file.newFilename;
    console.log("newGood", newGood);
    newGood.save((err) => {
      if (err) {
        return res.status(400).json({
          mes: err.message,
        });
      }
    });
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    console.log("newGood", newGood);
    res.json({ fields, files });
  });
}

async function changeField(req, res, next) {
  console.log("changeField");
  const update = {};
  const newGood = new Good();

  const form = new formidable.IncomingForm({
    multiples: true,
    uploadDir: "./upload/",
    keepExtensions: true,
  });

  form.on("field", async (field, value) => {
    update[field] = value
  });

  form.on("file", (formname, file) => {
    update.img = file.newFilename;
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    const good = await Good.findByIdAndUpdate({ _id: fields._id }, update);
    res.json({ fields, files });
  });
}

module.exports = {
  addGoods,
  getGoods,
  addOneGood,
  changeField,
};
