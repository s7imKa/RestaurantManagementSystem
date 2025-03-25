const express = require("express");
const router = express.Router();
const Dish = require("../models/Dish");
const { isAuthenticated } = require("../middleware/isAuthenticated");
const Order = require("../models/Order");
const Reservation = require("../models/Reservation");
const CartItem = require("../models/CartItem");
const { Op } = require("sequelize");
const { literal } = require("sequelize");


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
        // Update order statuses
        const ordersToUpdate = await Order.findAll({
            where: { userId: req.user.id, status: "Pending" },
        });
        for (const order of ordersToUpdate) {
            const createdAt = new Date(order.createdAt);
            const now = new Date();
            const diff = now.getTime() - createdAt.getTime();
            const minutes = Math.floor(diff / 60000);

            if (minutes >= 5) {
                order.status = "Processing";
                await order.save();
            }
        }

        const orders = await Order.findAll({
            where: {
                userId: req.user.id,
                createdAt: {
                    [Op.gte]: new Date(new Date() - 60 * 60 * 1000), // Orders created in the last hour
                },
            },
        });

        const reservations = await Reservation.findAll({
            where: {
                userId: req.user.id,
                date: {
                    [Op.gte]: literal("CURRENT_DATE"), // Reservations for future dates
                },
            },
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

router.post("/profile/reservations/cancel/:id",isAuthenticated,async (req, res) => {
        const { id } = req.params;

        try {
            await Reservation.destroy({
                where: {
                    id: id,
                    userId: req.user.id, // Ensure the user can only cancel their own reservations
                },
            });
            res.redirect("/profile");
        } catch (err) {
            console.error("Error cancelling reservation:", err);
            res.status(500).send("Error cancelling reservation");
        }
    }
);

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
