/** @format */

const request = require("request");
const uploadUrl = "https://api.pcloud.com/uploadfile";
const { Good } = require("../schemas/goods.schema");
const formidable = require("formidable");
const fs = require("fs");

const uploadDir = "./public/images/";

async function addOneGoodCloud(req, res, next) {
  const newGood = new Good();
  const formData = {};
  const fileUrl = "";

  const form = new formidable.IncomingForm({
    multiples: true,
    uploadDir,
    keepExtensions: true,
  });

  form.on("field", (fieldName, fieldValue) => {
    newGood[fieldName] = fieldValue;
  });

  form.on("file", (name, file) => {
    newGood.img = file.newFilename;
    formData.filename = file.newFilename;
      formData.file = fs.createReadStream(file.filepath);
      formData.access_token = process.env.CLIENT_SECRET;
      formData.folderid = process.env.CLIENT_ID;
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }

    request.post(
      { url: uploadUrl, formData },
      (err, httpResponse, body) => {
        console.log("request", request);
        if (err) {
          console.error(err);
        } else {
          // Отримуємо інформацію про завантажений файл з відповіді від сервера pCloud API
          const response = JSON.parse(body);
          console.log("response", response);
          if (response.result === 0) {
            return res
              .status(500)
              .json({ error: "Failed to upload file to pCloud" });
          }
          // Повертаємо URL завантаженого файлу у відповіді на запит
          //fileUrl = `https://my.pcloud.com/${response.metadata.path}`;
        }
      }
    );

    const result = await newGood.save();
    return res.json({ message: result, fileUrl});
  });
}

module.exports = {
  addOneGoodCloud,
};
