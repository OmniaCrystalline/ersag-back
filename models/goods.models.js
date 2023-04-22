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
  const { _id, data } = req.body;
  console.log('data, _id', data, _id)

  if (data.file) {
    const form = new formidable.IncomingForm({
      multiples: true,
      uploadDir: "./upload/",
      keepExtensions: true,
    });

    form.on("file", async (formname, file) => {
      try {
        const res = await Good.findByIdAndUpdate(
          _id,
          { file: file.newFilename },
          { new: true }
        );
        console.log('res.data', res.data)
      } catch (error) {
        console.error(error);
      }
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        next(err);
        return;
      }
      res.json({ fields, files });
    });
  } else {
    try {
      const res = await Good.findByIdAndUpdate(_id, data, { new: true });
      console.log('res.data', res.data)
      return res.json(res);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = {
  addGoods,
  getGoods,
  addOneGood,
  changeField,
};
