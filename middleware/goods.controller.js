/** @format */

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const controller = async(
  upload.fields([{ name: "file" }]),
  req,
  res,
  next,
    (err) => {
      if(err) throw new Error(err.message)
    // Отримуємо файли, які були завантажені з форми
      const files = req.files["file"];
      const res = axios.post('flickr', files)

        const otherData = req.body;
        console.log("otherData", otherData,files);

    return res.json({ message: "Файл успішно завантажено!" });
  }
);
// Використовуємо метод upload.fields() для отримання файлів
