/** @format */
require("dotenv").config();
const { Good } = require("../schemas/goods.schema");
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const uploadDir = path.join(process.cwd(), "upload");
const filesFolderChanger = process.env.REACT_APP_URL;

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
  console.log("addOneGood");
  const newGood = new Good();

  const form = new formidable.IncomingForm({
    multiples: true,
    uploadDir,
    keepExtensions: true,
  });

  form.on("field", (fieldName, fieldValue) => {
    newGood[fieldName] = fieldValue;
  });

  form.on("file", async(name, file) => {
    newGood.img = `${filesFolderChanger}/static/${file.newFilename}`;
  });

  form.parse(req, async(err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    const result = newGood.save();
    return res.json({message: result})
  });
}

async function changeField(req, res, next) {
  console.log("changeField");
  const updated = {};

  const form = new formidable.IncomingForm({
    multiples: true,
    uploadDir,
    keepExtensions: true,
  });

  form.on("file", function (name, file) {
    updated.img = `${filesFolderChanger}/static/${file.newFilename}`;
    console.log("Uploaded " + file.newFilename);
  });

  form.on("field", async (field, value) => {
    updated[field] = value;
  });

  form.parse(req, async(err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    //console.log(updated)
    const item = await Good.findById(updated._id)
    console.log('item', item.img)
    const elem = await Good.findByIdAndUpdate(updated._id, updated, {new: true})
    const toDelImg = item.img.match(/static\/(.*)/)[1];
    const filePath = uploadDir + '\\' + toDelImg
    console.log('filePath', filePath)
    fs.unlinkSync(filePath);
    return res.json({message: elem})
  });
}

module.exports = {
  addGoods,
  getGoods,
  addOneGood,
  changeField,
};
