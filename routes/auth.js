const express = require("express");
const router = express.Router();
const passport = require("../passport");
const User = require("../models/User");
const { isAuthenticated } = require("../middleware/isAuthenticated");

router.get("/register", (req, res) => {
    const message = req.flash("error");
    res.render("register", { message: message.length > 0 ? message[0] : "" });
});

router.post("/register", async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        // Перевірка: ім'я має містити тільки букви (латинські або українські)
        const nameRegex = /^[A-Za-zА-Яа-яІіЇїЄєҐґ]+$/;
        if (!nameRegex.test(username)) {
            req.flash("error", "Username must contain only letters (Latin or Ukrainian).");
            return res.redirect("/auth/register");
        }

        // Перевірка: пароль має бути не менше 4 символів
        if (password.length < 4) {
            req.flash("error", "Password must be at least 4 characters long.");
            return res.redirect("/auth/register");
        }

        // Перевірка: паролі мають збігатися
        if (password !== confirmPassword) {
            req.flash("error", "Passwords do not match.");
            return res.redirect("/auth/register");
        }

        // Перевірка: чи існує користувач із таким email
        const existingUser = await User.findOne({ where: { email: email } });

        if (existingUser) {
            req.flash("error", "Email already exists.");
            return res.redirect("/auth/register");
        }

        // Створення нового користувача
        const user = await User.create({ username, email, password });
        res.redirect("/auth/login");
    } catch (err) {
        console.error("Error registering user:", err);
        req.flash("error", "Registration failed. Please try again.");
        res.redirect("/auth/register");
    }
});

router.get("/login", (req, res) => {
    const message = req.flash("error");
    res.render("login", { message: message.length > 0 ? message[0] : "" });
});

router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            console.error("Authentication error:", err);
            return next(err);
        }
        if (!user) {
            console.log("Authentication failed:", info.message);
            req.flash("error", info.message);
            return res.redirect("/auth/login");
        }
        req.login(user, (err) => {
            if (err) {
                console.error("Login error:", err);
                return next(err);
            }
            console.log("User logged in:", user);
            res.redirect("/");
        });
    })(req, res, next);
});

router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});

module.exports = router;
