/** @format */

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
  const {
    formData: {
      describe,
      img,
      usage,
      title,
      price,
      quantity,
      volume,
      type,
      file,
    },
  } = req.body;

  const url = axios.post("https://api.flickr.com/services", {
    body: {
      api_key: "8ebb6ad5b93e2c9a162d9a6f7dd3e4fd",
      photo_id: "1",
      formData: file,
    },
  });
  console.log(url);

  try {
    const list = await Good.create([
      {
        describe,
        img,
        usage,
        title,
        price,
        quantity,
        volume,
        type,
      },
    ]);
    return res.json({ message: `${list} was added` });
  } catch (error) {
    return res.json(error.message);
  }

  const FlickrURL = (id, secret) => {
    return `https://live.staticflickr.com/65535/${id}_${secret}_m.jpg`;
  };
}

module.exports = {
  addGoods,
  getGoods,
  addOneGood,
};
