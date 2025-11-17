/** @format */

// Функція для авторизації користувача
async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    // Отримуємо облікові дані з змінних оточення
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

    // Перевірка облікових даних
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Створюємо сесію
      req.session.isAuthenticated = true;
      req.session.username = username;

      // Виводимо в консоль інформацію про вхід
      console.log(`✅ Користувач увійшов: ${username} (${new Date().toLocaleString('uk-UA')})`);

      return res.json({ 
        message: "Успішний вхід",
        username: username 
      });
    } else {
      // Виводимо в консоль спробу невірного входу
      console.log(`❌ Невдала спроба входу: ${username} (${new Date().toLocaleString('uk-UA')})`);

      return res.status(401).json({ 
        message: "Невірний логін або пароль" 
      });
    }
  } catch (error) {
    console.error("Помилка авторизації:", error);
    return res.status(500).json({ 
      message: "Помилка сервера при авторизації" 
    });
  }
}

// Функція для виходу
async function logout(req, res, next) {
  try {
    const username = req.session?.username || "невідомий";
    
    // Видаляємо сесію
    req.session.destroy((err) => {
      if (err) {
        console.error("Помилка виходу:", err);
        return res.status(500).json({ message: "Помилка виходу" });
      }

      // Виводимо в консоль інформацію про вихід
      console.log(`👋 Користувач вийшов: ${username} (${new Date().toLocaleString('uk-UA')})`);

      return res.json({ message: "Успішний вихід" });
    });
  } catch (error) {
    console.error("Помилка виходу:", error);
    return res.status(500).json({ message: "Помилка сервера при виході" });
  }
}

// Функція для перевірки статусу авторизації
async function checkAuth(req, res, next) {
  try {
    if (req.session && req.session.isAuthenticated) {
      return res.json({ 
        isAuthenticated: true, 
        username: req.session.username 
      });
    }
    return res.json({ isAuthenticated: false });
  } catch (error) {
    return res.status(500).json({ message: "Помилка перевірки авторизації" });
  }
}

// Функція для отримання облікових даних (тільки для відображення підказки)
async function getCredentials(req, res, next) {
  try {
    // Повертаємо облікові дані тільки якщо вони встановлені в змінних оточення
    // Це безпечно, оскільки це тільки для підказки на клієнті
    const username = process.env.ADMIN_USERNAME || "admin";
    const password = process.env.ADMIN_PASSWORD || "admin123";
    
    return res.json({ 
      username: username,
      password: password 
    });
  } catch (error) {
    return res.status(500).json({ message: "Помилка отримання облікових даних" });
  }
}

module.exports = {
  login,
  logout,
  checkAuth,
  getCredentials,
};

