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
    // uploadDir: "./upload/",
    keepExtensions: true,
  });

  form.parse(req);

  form.on("fileBegin", function (name, file) {
    file.path = __dirname + "/uploads/" + file.name;
  });

  form.on("field", (fieldName, fieldValue) => {
    newGood[fieldName] = fieldValue;
  });

  form.on("file", function (name, file) {
    newGood.img = `https://ersagback.onrender.com/static/${file.name}`;
    console.log("Uploaded " + file.name);
  });
}

async function changeField(req, res, next) {
  console.log("changeField");
  const updated = {};

  const form = new formidable.IncomingForm({
    multiples: true,
    //uploadDir: "./upload/",
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    form.on("file", function (name, file) {
      updated.img = `https://ersagback.onrender.com/static/${file.name}`;
      console.log("Uploaded " + file.name);
    });

    form.on("field", async (field, value) => {
      updated[field] = value;
    });
    const good = await Good.findByIdAndUpdate({ _id: fields._id }, updated);
    console.log("good", good);
  });
}

module.exports = {
  addGoods,
  getGoods,
  addOneGood,
  changeField,
};
