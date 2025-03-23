const express = require("express");
const router = express.Router();
const passport = require("../passport");
const User = require("../models/User");
const { isAuthenticated } = require("../middleware/isAuthenticated");

router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            req.flash("error", "Passwords do not match.");
            return res.redirect("/auth/register");
        }

        const existingUser = await User.findOne({ where: { email: email } });

        if (existingUser) {
            req.flash("error", "Email already exists.");
            return res.redirect("/auth/register");
        }

        const user = await User.create({ username, email, password });
        res.redirect("/auth/login");
    } catch (err) {
        console.error("Error registering user:", err);
        req.flash("error", "Registration failed. Please try again.");
        res.redirect("/auth/register");
    }
});

router.get("/login", (req, res) => {
    res.render("login", { message: req.flash("error") });
});

router.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/auth/login",
        failureFlash: true,
    })
);

router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});

module.exports = router;
