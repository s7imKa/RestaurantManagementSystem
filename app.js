const sequelize = require("./config/database"); // Add this line
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const multer = require("multer");
const upload = multer({ dest: "public/images/" }); // Destination folder for uploaded images
const session = require("express-session"); // Add this line
const passport = require("./passport"); // Add this line
const flash = require("connect-flash"); // Add this line
const User = require("./models/User");
const Session = require("./models/Session");
const bcrypt = require("bcryptjs"); // Add this line

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
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
    res.locals.messages = req.flash();
    next();
});

// Static files
app.use(express.static("public"));

// Routes
const indexRoutes = require("./routes/index");
const bookingRoutes = require("./routes/booking");
const adminRoutes = require("./routes/admin");
const orderRoutes = require("./routes/order");
const authRoutes = require("./routes/auth"); // Add this line

app.use("/", indexRoutes);
app.use("/booking", bookingRoutes);
app.use("/admin", adminRoutes);
app.use("/order", orderRoutes);
app.use("/auth", authRoutes); // Add this line

sequelize.sync().then(() => {
    // Move this line here
    console.log("Database & tables created!");
});

// Start server
app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(hashedPassword);
}


