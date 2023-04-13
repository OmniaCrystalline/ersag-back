/** @format */
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { Good } = require("../schemas/goods.schema");


async function addGoods(req, res, next) {
  console.log("req.body", req.body);
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
  const {title, usage, describe, volume, img, price, quantity} = req.body
  upload.single('file')
  console.log('req', req.files)

  const url = axios.post("https://api.flickr.com/services", {
    body: {
      api_key: process.env.FLICKR_KEY,
      photo_id: "1",
      file,
    },
  });

  console.log(url);

  try {
    const list = await Good.create([
      title,
      usage,
      describe,
      Number(volume),
      img,
      Number(price),
      Number(quantity),
    ]);
    return res.json({ message: `${list} was added` });
  } catch (error) {
    return res.json(error.message);
  }
};

/*  const FlickrURL = (id, secret) => {
    return `https://live.staticflickr.com/65535/${id}_${secret}_m.jpg`;
  };*/


module.exports = {
  addGoods,
  getGoods,
  addOneGood,
};
