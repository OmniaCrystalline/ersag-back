/** @format */

// Middleware для перевірки авторизації
function requireAuth(req, res, next) {
  if (req.session && req.session.isAuthenticated) {
    return next();
  }

  // Якщо запит очікує JSON, повертаємо JSON помилку
  if (req.headers.accept && req.headers.accept.includes("application/json")) {
    return res.status(401).json({ message: "Необхідна авторизація" });
  }

  // Інакше перенаправляємо на сторінку логіну
  return res.redirect("/login");
}

// Middleware для перевірки авторизації для HTML сторінок
function requireAuthForPages(req, res, next) {
  // Якщо це запит на HTML сторінку
  if (req.headers.accept && req.headers.accept.includes("text/html")) {
    if (!req.session || !req.session.isAuthenticated) {
      return res.redirect("/login");
    }
  }
  return next();
}

module.exports = { requireAuth, requireAuthForPages };

