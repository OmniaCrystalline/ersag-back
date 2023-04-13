/** @format */

require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const { HOST_DB, USER, PASS, EMAIL, NEWPASS, USER_NAME, MONGO_URL } =
  process.env;
const PORT = 3000;
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

//2 routers
const router = express.Router();
const logger = require("morgan");
const cors = require("cors");
const { Types } = require("mongoose");
const { Schema, model } = require("mongoose");
const controllerGoods = require("./models/goods.models");
const controllerOrders = require("./models/order.models");

async function main() {
  try {
    if (!MONGO_URL) {
      throw new Error("HOST_DB not set!");
    }
    await mongoose.connect(MONGO_URL);
    console.log("Database connection successful");
    app.listen(PORT, (err) => {
      if (err) throw err;
      console.log(`server is listening on port: ${PORT}`);
    });
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}
main();

//routes
const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(
  cors({
    origin: true,
    methods: ["POST"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", router);
app.use((req, res) => {
  return res.status(404).json({ message: "Not found" });
});

{/*app.post('/addOne', upload.fields([{ name: 'file' }, { name: 'otherInput' }]), (req, res) => {
  const file = req.files['file'][0];
const otherInput = req.body['otherInput'];*/}

app.use((err, req, res, next) => {
  console.log("500", err);
  if (!Types.ObjectId.isValid(req.params.id))
    res.status(404).json({ message: "Not found" });
  return res.status(500).json({ message: err.message });
});

const cpUpload = upload.fields([
  { name: "file" },
  { name: "title" },
  { name: "title" },
  { name: "title" },
  { name: "title" },
  { name: "title" },
  { name: "title" },
]);


router.post("/", controllerOrders.addOrder);
router.post("/addOne", controllerGoods.addOneGood);
router.post("/add", controllerGoods.addGoods);
router.get("/", controllerGoods.getGoods);
