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
  console.log('req.body', req.body)

  if (!Object.keys(data).length) {
    console.log("delete");
    const data = await Good.findByIdAndRemove({ _id: _id });
    return res.json({ data });
  } else if (data.file) {
    console.log("file update");
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
      console.log("update field");
      const key = Object.keys(data);
      const elem = await Good.findOne({ _id });
      let val = Object.values(data).toString();

      if (Number(Object.values(req.body.data))) {
        val = Number(Object.values(req.body.data));
      }

      elem[key] = val;
      await elem.save();
      return res.json(elem);
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
