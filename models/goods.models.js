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
  const newGood = new Good();

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

    res.json({ fields, files });
  });
}

async function changeField(req, res, next) {
  const { field, _id } = req.body;
  try {
    await Good.findByIdAndUpdate({
      _id,
      field,
    });
    return res.json({message: `${_id} - ${field}`})
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  addGoods,
  getGoods,
  addOneGood,
  changeField,
};
