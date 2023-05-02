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
  const newGood = new Good()
  const form = new formidable.IncomingForm({
    multiples: true,
    uploadDir: "./upload/",
    keepExtensions: true,
  });

  form.on("field", (fieldName, fieldValue) => {
    newGood[fieldName] = fieldValue;
  });

   form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    let oldPath = files.profilePic.filepath;
    let newPath = path.join(__dirname, "uploads") + "/" + files.profilePic.name;
    let rawData = fs.readFileSync(oldPath);

    fs.writeFile(newPath, rawData, function (err) {
      if (err) console.log(err);
      //return res.send("Successfully uploaded");
    });
    newGood.img = `https://ersagback.onrender.com/static/${newPath}`;
    console.log("newGood", newGood);
    res.json({ fields, files });
  });
}

async function changeField(req, res, next) {
  console.log("changeField");
  const updated = {}

  const form = new formidable.IncomingForm({
    multiples: true,
    uploadDir: "./upload/",
    keepExtensions: true,
  });

  form.on("field", async (field, value) => {
    updated[field] = value
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    let oldPath = files.profilePic.filepath;
    let newPath = path.join(__dirname, "uploads") + "/" + files.profilePic.name;
    let rawData = fs.readFileSync(oldPath);

    fs.writeFile(newPath, rawData, function (err) {
      if (err) console.log(err);
      //return res.send("Successfully uploaded");
    });
    updated.img=`https://ersagback.onrender.com/static/${newPath}`;
    const good = await Good.findByIdAndUpdate({ _id: fields._id }, updated);
    console.log('good', good)
    res.json({ fields, files });
  });
}

module.exports = {
  addGoods,
  getGoods,
  addOneGood,
  changeField,
};
