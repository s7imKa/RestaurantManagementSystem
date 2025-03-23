const express = require("express");
const router = express.Router();
const Dish = require("../models/Dish");
const { isAuthenticated } = require("../middleware/isAuthenticated");
const Order = require("../models/Order");
const Reservation = require("../models/Reservation");
const CartItem = require("../models/CartItem");

router.get("/", (req, res) => {
    Dish.findAll()
        .then((dishes) => {
            res.render("home", { dishes: dishes, req: req });
        })
        .catch((err) => {
            console.error("Error fetching dishes:", err);
            res.status(500).send("Error fetching dishes");
        });
});

router.get("/profile", isAuthenticated, async (req, res) => {
    try {
        const orders = await Order.findAll({ where: { userId: req.user.id } });
        const reservations = await Reservation.findAll({
            where: { userId: req.user.id },
        });
        res.render("profile", {
            orders: orders,
            reservations: reservations,
            req: req,
        });
    } catch (err) {
        console.error("Error fetching profile data:", err);
        res.status(500).send("Error fetching profile data");
    }
});

router.get("/cart", isAuthenticated, async (req, res) => {
    try {
        const cartItems = await CartItem.findAll({
            where: { userId: req.user.id },
        });
        res.render("cart", { cartItems: cartItems, req: req });
    } catch (err) {
        console.error("Error fetching cart items:", err);
        res.status(500).send("Error fetching cart items");
    }
});

module.exports = router;
