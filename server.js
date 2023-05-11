/** @format */

require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const { MONGO_URL } = process.env;
const PORT = 3000;
const router = express.Router();
const logger = require("morgan");
const cors = require("cors");
const { Types } = require("mongoose");
const morgan = require("morgan");

const controllerGoods = require("./models/goods.models");
const controllerOrders = require("./models/order.models");
const formatsLogger = app.get("env") === "development" ? "dev" : "short";

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

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/", router);
app.use((req, res) => {
  return res.status(404).json({ message: "Not found" });
});
app.use((err, req, res, next) => {
  console.log("500", err);
  if (!Types.ObjectId.isValid(req.params.id))
    res.status(404).json({ message: "Not found" });
  return res.status(500).json({ message: err.message });
});

router.get("/products", controllerGoods.getGoods);
router.post("/", controllerOrders.addOrder);
router.post("/addOne", controllerGoods.addOneGood);
router.patch("/editField", controllerGoods.changeField);
router.post("/add", controllerGoods.addGoods);
router.post("/order", controllerOrders.addOrder);
router.get("/order", controllerOrders.fetchOrders);
router.delete("/deleteOne", controllerGoods.deleteGood);
