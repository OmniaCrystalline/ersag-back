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
const session = require("express-session");

const controllerGoods = require("./models/goods.models");
const controllerOrders = require("./models/order.models");
const controllerAuth = require("./models/auth.models");
const { requireAuth, requireAuthForPages } = require("./middleware/auth");
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
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());

// Налаштування сесій
app.use(
  session({
    secret:
      process.env.SESSION_SECRET || "ersag-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Встановіть true для HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 години
    },
  })
);

// Публічні маршрути (не потребують авторизації)
router.get("/login", (req, res) => {
  // Якщо вже авторизований, перенаправляємо на головну
  if (req.session && req.session.isAuthenticated) {
    return res.redirect("/");
  }
  return res.sendFile("login.html", { root: "./public" });
});

router.post("/login", controllerAuth.login);
router.post("/logout", controllerAuth.logout);
router.get("/checkAuth", controllerAuth.checkAuth);
router.get("/getCredentials", controllerAuth.getCredentials);

// Маршрут /products - повертає HTML для браузера або JSON для API
router.get("/products", requireAuthForPages, (req, res, next) => {
  // Якщо є query параметр ?json або явно запитують тільки JSON (без text/html), повертаємо JSON
  if (
    req.query.json === "true" ||
    (req.headers.accept &&
      req.headers.accept.includes("application/json") &&
      !req.headers.accept.includes("text/html"))
  ) {
    return controllerGoods.getGoods(req, res, next);
  }

  // За замовчуванням повертаємо HTML сторінку (для браузера)
  return res.sendFile("products.html", { root: "./public" });
});

// Маршрут /order - повертає HTML для браузера або JSON для API
router.get("/order", requireAuthForPages, (req, res, next) => {
  // Перевіряємо, чи це запит на JSON
  // JSON повертаємо тільки якщо:
  // 1. Є query параметр ?json=true
  // 2. АБО явно запитують JSON (Accept: application/json без text/html)
  const acceptHeader = req.headers.accept || "";
  const userAgent = req.headers["user-agent"] || "";
  const isBrowser =
    userAgent.includes("Mozilla") ||
    userAgent.includes("Chrome") ||
    userAgent.includes("Safari") ||
    userAgent.includes("Firefox");

  const wantsJson =
    req.query.json === "true" ||
    (acceptHeader.includes("application/json") &&
      !acceptHeader.includes("text/html") &&
      !acceptHeader.includes("*/*") &&
      !isBrowser);

  if (wantsJson) {
    return controllerOrders.fetchOrders(req, res, next);
  }

  // За замовчуванням повертаємо HTML сторінку (для браузера)
  return res.sendFile("orders.html", { root: "./public" });
});

// Маршрут /archive - повертає HTML для браузера або JSON для API (захищений)
router.get("/archive", requireAuthForPages, (req, res, next) => {
  // Перевіряємо, чи це запит на JSON
  if (
    req.query.json === "true" ||
    (req.headers.accept &&
      req.headers.accept.includes("application/json") &&
      !req.headers.accept.includes("text/html"))
  ) {
    return controllerOrders.fetchArchive(req, res, next);
  }
  // Якщо авторизований, показуємо сторінку замовлень з табом "Архів"
  return res.sendFile("orders.html", { root: "./public" });
});

// Публічні маршрути (створення замовлень доступне всім)
router.post("/", controllerOrders.addOrder);
router.post("/order", controllerOrders.addOrder);

// Захищені маршрути (потребують авторизації)
router.post("/addOne", requireAuth, controllerGoods.addOneGood);
router.patch("/editField", requireAuth, controllerGoods.changeField);
router.post("/add", requireAuth, controllerGoods.addGoods);
router.delete("/deleteOne", requireAuth, controllerGoods.deleteGood);
router.patch("/moveToArchive", requireAuth, controllerOrders.moveToArchive);
router.patch(
  "/restoreFromArchive",
  requireAuth,
  controllerOrders.restoreFromArchive
);

app.use("/", router);

// Потім обробляємо статичні файли (тільки якщо маршрут не знайдено)
app.use(express.static("public"));

// Обробка 404
app.use((req, res) => {
  // Якщо запит на API (починається з /api або очікує JSON), повертаємо JSON
  if (
    req.path.startsWith("/api") ||
    req.headers.accept?.includes("application/json")
  ) {
    return res.status(404).json({ message: "Not found" });
  }
  // Інакше повертаємо HTML сторінку 404
  return res.status(404).sendFile("404.html", { root: "./public" });
});

// Обробка помилок
app.use((err, req, res, next) => {
  console.log("500", err);
  if (!Types.ObjectId.isValid(req.params.id))
    res.status(404).json({ message: "Not found" });
  return res.status(500).json({ message: err.message });
});
