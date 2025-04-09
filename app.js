const sequelize = require("./config/database"); // Add this line
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const multer = require("multer");
const upload = multer({ dest: "public/images/" }); // Destination folder for uploaded images
const session = require("express-session"); // Add this line
const passport = require("./passport"); // Add this line
const flash = require("connect-flash"); // Add this line
const bcrypt = require("bcryptjs"); // Add this line
const adminController = require("./controllers/adminController"); // Import the admin controller
const path = require("path"); // Add this line
const methodOverride = require("method-override"); // Add this line

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");

// Add these lines
app.use(
    session({
        secret: "ibef9wd9f8wd9f7wd8f9w8dfydclskfv", // Change this to a strong, random key
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 30 * 60 * 1000, // 30 minutes
        },
    })
);

app.use(flash()); // Add this line
app.use(passport.initialize()); // Add this line
app.use(passport.session()); // Add this line

app.use((req, res, next) => {
    res.locals.error = req.flash("error");
    res.locals.messages = req.flash();
    res.locals.user = req.user;
    next();
});

// Додаємо middleware для поддержки методов PUT и DELETE
app.use(methodOverride("_method")); // Add this line

// Static files
app.use(express.static(path.join(__dirname, "public"))); // Add this line

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
app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000  ✅ ");
});

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(hashedPassword);
}
