/** @format */
require("dotenv").config();
const { Good } = require("../schemas/goods.schema");
const formidable = require("formidable");
const fs = require("fs");
const { Order } = require("../schemas/order.schema");
const cloudinary = require("cloudinary").v2;
const uploadDir = "./public/images/";

// Налаштування Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
  let uploadedImageUrl = null;
  let uploadedPublicId = null;
  let localFilePath = null;

  const form = new formidable.IncomingForm({
    multiples: true,
    uploadDir,
    keepExtensions: true,
  });

  form.on("field", (fieldName, fieldValue) => {
    if (fieldName === "file") newGood.img = fieldValue;
    else {
      newGood[fieldName] = fieldValue;
    }
  });

  form.on("file", (name, file) => {
    if (file) {
      newGood.img = file.newFilename;
      localFilePath = file.filepath;
    }
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Помилка парсингу форми:", err);
      return res.status(400).json({ 
        message: "Помилка обробки форми", 
        error: err.message 
      });
    }

    try {
      // Перевірка наявності обов'язкових полів
      if (!newGood.title || !newGood.describe || !newGood.price || !newGood.type) {
        // Видаляємо локальний файл, якщо він є
        if (localFilePath && fs.existsSync(localFilePath)) {
          try {
            fs.unlinkSync(localFilePath);
          } catch (unlinkError) {
            console.log("Помилка видалення локального файлу:", unlinkError.message);
          }
        }
        return res.status(400).json({ 
          message: "Відсутні обов'язкові поля (title, describe, price, type)" 
        });
      }

      // Завантаження зображення на Cloudinary
      if (files && Object.keys(files).length > 0) {
        const fileKey = Object.keys(files)[0];
        const file = files[fileKey];
        
        if (file && file.filepath) {
          try {
            // Перевірка наявності конфігурації Cloudinary
            if (!process.env.CLOUDINARY_CLOUD_NAME || 
                !process.env.CLOUDINARY_API_KEY || 
                !process.env.CLOUDINARY_API_SECRET) {
              throw new Error("Cloudinary не налаштовано. Перевірте змінні середовища.");
            }

            const uploadResult = await cloudinary.uploader.upload(file.filepath, {
              folder: "products",
              resource_type: "auto",
            });
            
            if (!uploadResult || !uploadResult.secure_url) {
              throw new Error("Не вдалося отримати URL завантаженого зображення");
            }

            // Зберігаємо URL з Cloudinary
            uploadedImageUrl = uploadResult.secure_url;
            uploadedPublicId = uploadResult.public_id;
            newGood.img = uploadedImageUrl;
            
            // Видаляємо локальний файл після завантаження
            try {
              fs.unlinkSync(file.filepath);
              localFilePath = null;
            } catch (unlinkError) {
              console.log("Помилка видалення локального файлу:", unlinkError.message);
            }
          } catch (cloudinaryError) {
            console.error("Помилка завантаження на Cloudinary:", cloudinaryError);
            // Видаляємо локальний файл при помилці
            if (file.filepath && fs.existsSync(file.filepath)) {
              try {
                fs.unlinkSync(file.filepath);
              } catch (unlinkError) {
                console.log("Помилка видалення локального файлу:", unlinkError.message);
              }
            }
            return res.status(500).json({ 
              message: "Помилка завантаження зображення на Cloudinary", 
              error: cloudinaryError.message 
            });
          }
        } else if (!newGood.img) {
          return res.status(400).json({ 
            message: "Зображення є обов'язковим полем" 
          });
        }
      } else if (!newGood.img) {
        return res.status(400).json({ 
          message: "Зображення є обов'язковим полем" 
        });
      }

      // Збереження товару в базу даних
      try {
        const result = await newGood.save();
        console.log("Товар успішно додано:", result._id);
        return res.json({ message: result });
      } catch (saveError) {
        console.error("Помилка збереження товару:", saveError);
        
        // Якщо товар не збережено, але зображення вже завантажено на Cloudinary, видаляємо його
        if (uploadedPublicId) {
          try {
            await cloudinary.uploader.destroy(uploadedPublicId);
            console.log("Видалено зображення з Cloudinary через помилку збереження");
          } catch (deleteError) {
            console.error("Помилка видалення зображення з Cloudinary:", deleteError);
          }
        }
        
        // Видаляємо локальний файл, якщо він ще є
        if (localFilePath && fs.existsSync(localFilePath)) {
          try {
            fs.unlinkSync(localFilePath);
          } catch (unlinkError) {
            console.log("Помилка видалення локального файлу:", unlinkError.message);
          }
        }

        return res.status(500).json({ 
          message: "Помилка збереження товару в базу даних", 
          error: saveError.message 
        });
      }
    } catch (error) {
      console.error("Неочікувана помилка:", error);
      
      // Очищення при будь-якій помилці
      if (uploadedPublicId) {
        try {
          await cloudinary.uploader.destroy(uploadedPublicId);
        } catch (deleteError) {
          console.error("Помилка видалення зображення з Cloudinary:", deleteError);
        }
      }
      
      if (localFilePath && fs.existsSync(localFilePath)) {
        try {
          fs.unlinkSync(localFilePath);
        } catch (unlinkError) {
          console.log("Помилка видалення локального файлу:", unlinkError.message);
        }
      }

      return res.status(500).json({ 
        message: "Внутрішня помилка сервера", 
        error: error.message 
      });
    }
  });
}

async function changeField(req, res, next) {
  const updated = {};
  let uploadedImageUrl = null;
  let uploadedPublicId = null;
  let oldImagePublicId = null;
  let oldImageLocalPath = null;
  let localFilePath = null;

  const form = new formidable.IncomingForm({
    multiples: true,
    uploadDir,
    keepExtensions: true,
  });

  form.on("field", (field, value) => {
    // Пропускаємо порожні значення (крім числових полів, які можуть бути 0)
    if (value === '' && field !== 'price' && field !== 'volume' && field !== 'quantity' && field !== '_id') {
      return;
    }
    const numberFields = ["price", "volume", "quantity"];
    if (numberFields.includes(field)) {
      updated[field] = value !== '' ? Number(value) : undefined;
    } else {
      updated[field] = value;
    }
  });

  form.on("file", function (name, file) {
    // Обробляємо файл тільки якщо він дійсно існує і має розмір
    if (file && file.filepath && file.size > 0) {
      // Додаткова перевірка через fs.statSync
      try {
        if (fs.existsSync(file.filepath)) {
          const stats = fs.statSync(file.filepath);
          if (stats.size > 0) {
            updated.img = file.newFilename;
            localFilePath = file.filepath;
          }
        }
      } catch (error) {
        console.log("Помилка перевірки файлу:", error.message);
        // Не додаємо файл, якщо є помилка
      }
    }
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Помилка парсингу форми:", err);
      return res.status(400).json({ 
        message: "Помилка обробки форми", 
        error: err.message 
      });
    }

    try {
      if (!updated._id) {
        // Видаляємо локальний файл, якщо він є
        if (localFilePath && fs.existsSync(localFilePath)) {
          try {
            fs.unlinkSync(localFilePath);
          } catch (unlinkError) {
            console.log("Помилка видалення локального файлу:", unlinkError.message);
          }
        }
        return res.status(400).json({ message: "ID товару не вказано" });
      }

      const item = await Good.findById(updated._id);
      if (!item) {
        // Видаляємо локальний файл, якщо він є
        if (localFilePath && fs.existsSync(localFilePath)) {
          try {
            fs.unlinkSync(localFilePath);
          } catch (unlinkError) {
            console.log("Помилка видалення локального файлу:", unlinkError.message);
          }
        }
        return res.status(404).json({ message: "Товар не знайдено" });
      }

      // Зберігаємо інформацію про старе зображення
      if (item.img) {
        if (item.img.includes("cloudinary.com")) {
          oldImagePublicId = item.img.split("/").slice(-2).join("/").split(".")[0];
        } else {
          oldImageLocalPath = uploadDir + item.img;
        }
      }
      
      // Завантаження нового зображення на Cloudinary, якщо воно є (опціонально)
      // Перевіряємо, чи є файл і чи він дійсно переданий (не порожній)
      // Якщо localFilePath не встановлено, значить файл не був переданий або порожній
      if (localFilePath && files && Object.keys(files).length > 0) {
        const fileKey = Object.keys(files)[0];
        const file = files[fileKey];
        
        // Перевіряємо, чи файл дійсно існує і має розмір
        let fileExists = false;
        let fileHasSize = false;
        
        try {
          if (file && file.filepath && file.filepath === localFilePath) {
            fileExists = fs.existsSync(file.filepath);
            if (fileExists) {
              const stats = fs.statSync(file.filepath);
              fileHasSize = stats.size > 0;
            }
          }
        } catch (statError) {
          console.log("Помилка перевірки файлу:", statError.message);
          fileExists = false;
          fileHasSize = false;
        }
        
        if (fileExists && fileHasSize) {
          try {
            // Перевірка наявності конфігурації Cloudinary
            if (!process.env.CLOUDINARY_CLOUD_NAME || 
                !process.env.CLOUDINARY_API_KEY || 
                !process.env.CLOUDINARY_API_SECRET) {
              console.warn("Cloudinary не налаштовано. Пропускаємо завантаження зображення.");
              // Видаляємо локальний файл
              try {
                fs.unlinkSync(file.filepath);
              } catch (unlinkError) {
                console.log("Помилка видалення локального файлу:", unlinkError.message);
              }
              // Продовжуємо без завантаження зображення - НЕ повертаємо помилку
            } else {
              try {
                const uploadResult = await cloudinary.uploader.upload(file.filepath, {
                  folder: "products",
                  resource_type: "auto",
                });
                
                if (!uploadResult || !uploadResult.secure_url) {
                  throw new Error("Не вдалося отримати URL завантаженого зображення");
                }

                // Зберігаємо URL з Cloudinary
                uploadedImageUrl = uploadResult.secure_url;
                uploadedPublicId = uploadResult.public_id;
                updated.img = uploadedImageUrl;
                
                // Видаляємо локальний файл після завантаження
                try {
                  fs.unlinkSync(file.filepath);
                  localFilePath = null;
                } catch (unlinkError) {
                  console.log("Помилка видалення локального файлу:", unlinkError.message);
                }
              } catch (uploadError) {
                console.error("Помилка завантаження на Cloudinary:", uploadError);
                // Видаляємо локальний файл при помилці
                try {
                  if (fs.existsSync(file.filepath)) {
                    fs.unlinkSync(file.filepath);
                  }
                } catch (unlinkError) {
                  console.log("Помилка видалення локального файлу:", unlinkError.message);
                }
                // НЕ блокуємо оновлення інших полів - просто не оновлюємо зображення
                console.warn("Пропускаємо оновлення зображення через помилку. Інші поля будуть оновлені.");
                // НЕ повертаємо помилку клієнту - продовжуємо оновлення інших полів
              }
            }
          } catch (cloudinaryError) {
            console.error("Загальна помилка при обробці зображення:", cloudinaryError);
            // Видаляємо локальний файл при помилці
            if (file.filepath && fs.existsSync(file.filepath)) {
              try {
                fs.unlinkSync(file.filepath);
              } catch (unlinkError) {
                console.log("Помилка видалення локального файлу:", unlinkError.message);
              }
            }
            // НЕ блокуємо оновлення інших полів - просто не оновлюємо зображення
            console.warn("Пропускаємо оновлення зображення через помилку. Інші поля будуть оновлені.");
            // НЕ повертаємо помилку клієнту
          }
        } else {
          // Файл не передано або порожній - це нормально, просто не оновлюємо зображення
          console.log("Файл зображення не передано або порожній. Пропускаємо оновлення зображення.");
        }
      } else {
        // localFilePath не встановлено - файл не передавався взагалі
        console.log("Файл зображення не передавався. Пропускаємо оновлення зображення.");
      }
      
      // Видаляємо поле img з updated, якщо воно не було успішно завантажено
      // (щоб не перезаписати існуюче зображення порожнім значенням)
      if (!uploadedImageUrl) {
        delete updated.img;
      }
      
      // Видаляємо порожні поля з updated (всі поля опціональні при редагуванні)
      Object.keys(updated).forEach(key => {
        if (key === '_id') {
          return; // ID завжди залишаємо
        }
        
        // Для числових полів: якщо значення порожнє або undefined, видаляємо
        const numberFields = ["price", "volume", "quantity"];
        if (numberFields.includes(key)) {
          if (updated[key] === '' || updated[key] === undefined || isNaN(updated[key])) {
            delete updated[key];
          }
        } else {
          // Для текстових полів: якщо порожнє, видаляємо
          if (updated[key] === '' || updated[key] === undefined) {
            delete updated[key];
          }
        }
      });
      
      // Перевіряємо, чи є хоча б одне поле для оновлення (крім ID)
      const fieldsToUpdate = Object.keys(updated).filter(key => key !== '_id');
      if (fieldsToUpdate.length === 0) {
        // Видаляємо локальний файл, якщо він є
        if (localFilePath && fs.existsSync(localFilePath)) {
          try {
            fs.unlinkSync(localFilePath);
          } catch (unlinkError) {
            console.log("Помилка видалення локального файлу:", unlinkError.message);
          }
        }
        return res.status(400).json({ 
          message: "Не вказано жодного поля для оновлення" 
        });
      }

      // Оновлення товару в базі даних
      try {
        const elem = await Good.findByIdAndUpdate(updated._id, updated, {
          new: true,
        });

        if (!elem) {
          // Якщо оновлення не вдалося, видаляємо нове зображення з Cloudinary
          if (uploadedPublicId) {
            try {
              await cloudinary.uploader.destroy(uploadedPublicId);
            } catch (deleteError) {
              console.error("Помилка видалення нового зображення з Cloudinary:", deleteError);
            }
          }
          return res.status(500).json({ message: "Не вдалося оновити товар" });
        }

        // Видаляємо старе зображення після успішного оновлення, тільки якщо нове зображення було завантажено
        if (uploadedPublicId && oldImagePublicId) {
          try {
            await cloudinary.uploader.destroy(oldImagePublicId);
            console.log("Старе зображення видалено з Cloudinary");
          } catch (deleteError) {
            console.log("Помилка видалення старого зображення з Cloudinary:", deleteError.message);
          }
        } else if (uploadedPublicId && oldImageLocalPath && fs.existsSync(oldImageLocalPath)) {
          try {
            fs.unlinkSync(oldImageLocalPath);
            console.log("Старе локальне зображення видалено");
          } catch (error) {
            console.log("Помилка видалення старого локального файлу:", error.message);
          }
        }

        return res.json({ message: elem });
      } catch (updateError) {
        console.error("Помилка оновлення товару:", updateError);
        
        // Якщо оновлення не вдалося, видаляємо нове зображення з Cloudinary
        if (uploadedPublicId) {
          try {
            await cloudinary.uploader.destroy(uploadedPublicId);
          } catch (deleteError) {
            console.error("Помилка видалення нового зображення з Cloudinary:", deleteError);
          }
        }

        // Видаляємо локальний файл, якщо він ще є
        if (localFilePath && fs.existsSync(localFilePath)) {
          try {
            fs.unlinkSync(localFilePath);
          } catch (unlinkError) {
            console.log("Помилка видалення локального файлу:", unlinkError.message);
          }
        }

        return res.status(500).json({ 
          message: "Помилка оновлення товару в базі даних", 
          error: updateError.message 
        });
      }
    } catch (error) {
      console.error("Неочікувана помилка:", error);
      
      // Очищення при будь-якій помилці
      if (uploadedPublicId) {
        try {
          await cloudinary.uploader.destroy(uploadedPublicId);
        } catch (deleteError) {
          console.error("Помилка видалення нового зображення з Cloudinary:", deleteError);
        }
      }
      
      if (localFilePath && fs.existsSync(localFilePath)) {
        try {
          fs.unlinkSync(localFilePath);
        } catch (unlinkError) {
          console.log("Помилка видалення локального файлу:", unlinkError.message);
        }
      }

      return res.status(500).json({ 
        message: "Внутрішня помилка сервера", 
        error: error.message 
      });
    }
  });
}

async function deleteGood(req, res, next) {
  try {
    if (!req.query._id) {
      return res.status(400).json({ message: "ID товару не вказано" });
    }

    const item = await Good.findById(req.query._id);
    
    if (!item) {
      return res.status(404).json({ message: "Товар не знайдено" });
    }

    // Видаляємо зображення з Cloudinary, якщо воно там є
    if (item.img) {
      if (item.img.includes("cloudinary.com")) {
        try {
          const publicId = item.img.split("/").slice(-2).join("/").split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (deleteError) {
          console.log("Помилка видалення зображення з Cloudinary:", deleteError.message);
          // Продовжуємо видалення товару навіть якщо не вдалося видалити зображення
        }
      } else {
        // Якщо зображення локальне, видаляємо його
        try {
          const filePath = uploadDir + item.img;
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (error) {
          console.log("Помилка видалення локального файлу:", error.message);
          // Продовжуємо видалення товару навіть якщо не вдалося видалити файл
        }
      }
    }
    
    const result = await Good.findByIdAndRemove(req.query._id);
    
    if (!result) {
      return res.status(404).json({ message: "Товар не знайдено для видалення" });
    }

    return res.json({ message: result });
  } catch (error) {
    console.error("Помилка видалення товару:", error);
    return res.status(500).json({ 
      message: "Помилка видалення товару", 
      error: error.message 
    });
  }
}

async function moveToArchive(req, res, next) {
  try {
    const { _id } = req.body;
    const response = await Order.findByIdAndUpdate(_id, { active: false }, { new: true })
    return res.json({message: response})
  } catch (error) {
    return res.status(500).json({message: error})
  }
}

module.exports = {
  addGoods,
  getGoods,
  addOneGood,
  changeField,
  deleteGood,
  moveToArchive,
};

