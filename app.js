require('dotenv').config(); // Додаємо dotenv для використання змінних з .env
const sequelize = require("./config/database");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const multer = require("multer");
const upload = multer({ dest: "public/images/" }); // Destination folder for uploaded images
const session = require("express-session");
const passport = require("./passport");
const flash = require("connect-flash");
const bcrypt = require("bcryptjs");
const adminController = require("./controllers/adminController");
const path = require("path");
const methodOverride = require("method-override");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const sessionStore = new SequelizeStore({ db: sequelize });
const compression = require("compression");

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(compression());
app.set("view engine", "ejs");

app.use(
    session({
        secret: process.env.SESSION_SECRET, // Використовуйте секрет із .env
        resave: false,
        saveUninitialized: false,
        store: sessionStore, // Зберігаємо сесії в базі даних
        cookie: {
            maxAge: 30 * 60 * 1000, // 30 хвилин
            httpOnly: true, // Забезпечує безпеку cookies
            secure: process.env.NODE_ENV === "production",
            sameSite: "none", // Або "strict" для більшої безпеки
        },
    })
);

sessionStore.sync(); // Синхронізує таблицю сесій

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.error = req.flash("error");
    res.locals.messages = req.flash();
    res.locals.user = req.user;
    next();
});

app.use((req, res, next) => {
    console.log("Session ID:", req.sessionID);
    console.log("Session Data:", req.session);
    next();
});

// Додаємо middleware для поддержки методов PUT и DELETE
app.use(methodOverride("_method"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
const indexRoutes = require("./routes/index");
const bookingRoutes = require("./routes/booking");
const adminRoutes = require("./routes/admin");
const orderRoutes = require("./routes/order");
const authRoutes = require("./routes/auth");
const dishRoutes = require("./routes/admin");

app.use("/", indexRoutes);
app.use("/booking", bookingRoutes);
app.use("/admin", adminRoutes);
app.use("/order", orderRoutes);
app.use("/auth", authRoutes);
app.use("/admin", dishRoutes);

// Run the updateOrderStatus function every 5 minutes
setInterval(adminController.updateOrderStatus, 300000); // 300000 milliseconds = 5 minutes

sequelize.sync()
    .then(() => {
        console.log("Database synchronized");
    })
    .catch(err => {
        console.error("Error synchronizing database:", err);
    });

// Start server
const PORT = process.env.PORT || 3000; // Використовуємо змінну з .env
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT} ✅`);
});

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(hashedPassword);
}
