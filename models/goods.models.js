/** @format */
require("dotenv").config();
const { Good } = require("../schemas/goods.schema");
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const uploadDir = path.join(process.cwd(), "upload");
const filesFolderChanger = process.env.URL_BACK;

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
    uploadDir,
    keepExtensions: true,
  });

  form.on("field", (fieldName, fieldValue) => {
    newGood[fieldName] = fieldValue;
  });

  form.on("file", (name, file) => {
    newGood.img = `${process.env.URL_BACK}/static/${file.newFilename}`;
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    const result = await newGood.save();
    return res.json({ message: result });
  });
}

async function changeField(req, res, next) {
  const updated = {};

  const form = new formidable.IncomingForm({
    multiples: true,
    uploadDir,
    keepExtensions: true,
  });

  form.on("field", (field, value) => {
    const number = "price" || "volume" || "quantity";
    updated[field] = field === number ? Number(value) : value;
  });

  form.on("file", function (name, file) {
    if (file) updated.img = `${filesFolderChanger}/static/${file.newFilename}`;
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }

    const item = await Good.findById(updated._id);

    try {
      const toDelImg = item.img.match(/static\/(.*)/);
      const filePath = uploadDir + "\\" + toDelImg[1];
      fs.unlinkSync(filePath);
    } catch (error) {
      console.log("error.message", error.message);
    }

    const elem = await Good.findByIdAndUpdate(updated._id, updated, {
      new: true,
    });

    return res.json({ message: elem });
  });
}

async function deleteGood(req, res, next) {
  const item = await Good.findById(req.query._id);
  try {
    const toDelImg = item.img.match(/static\/(.*)/);
    const filePath = uploadDir + "\\" + toDelImg[1];
    fs.unlinkSync(filePath);
  } catch (error) {
    console.log("error.message", error.message);
  }
  const result = await Good.findOneAndRemove(req.query._id);
  return res.json({ message: result });
}

module.exports = {
  addGoods,
  getGoods,
  addOneGood,
  changeField,
  deleteGood,
};
