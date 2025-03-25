const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { isAuthenticated } = require("../middleware/isAuthenticated");
const Dish = require("../models/Dish");
const CartItem = require("../models/CartItem");

router.get("/", isAuthenticated, (req, res) => {
    const dish = req.query.dish;
    res.render("order", { dish: dish });
});

router.post("/", isAuthenticated, (req, res) => {
    const {
        customerName,
        dish,
        city,
        street,
        houseNumber,
        apartmentNumber,
        phoneNumber,
    } = req.body;
    const userId = req.user.id;

    const deliveryAddress = `${city}, ${street}, ${houseNumber}, ${
        apartmentNumber || ""
    }`;

    Order.create({
        userId: userId,
        customerName: customerName,
        dish: dish,
        deliveryAddress: deliveryAddress,
        phoneNumber: phoneNumber,
    })
        .then(() => {
            res.redirect("/");
        })
        .catch((err) => {
            console.error("Error creating order:", err);
            res.status(500).send("Error creating order");
        });
});

router.post("/addToCart", isAuthenticated, async (req, res) => {
    const { dishName, dishPrice } = req.body;
    const userId = req.user.id;

    try {
        await CartItem.create({
            userId: userId,
            dishName: dishName,
            dishPrice: dishPrice,
        });
        res.redirect("/");
    } catch (err) {
        console.error("Error adding to cart:", err);
        res.status(500).send("Error adding to cart");
    }
});

router.post("/checkout", isAuthenticated, async (req, res) => {
    const {
        customerName,
        city,
        street,
        houseNumber,
        apartmentNumber,
        phoneNumber,
    } = req.body;
    const userId = req.user.id;

    try {
        const cartItems = await CartItem.findAll({ where: { userId: userId } });

        for (const item of cartItems) {
            const deliveryAddress = `${city}, ${street}, ${houseNumber}, ${
                apartmentNumber || ""
            }`;
            await Order.create({
                userId: userId,
                customerName: customerName,
                dish: item.dishName,
                deliveryAddress: deliveryAddress,
                phoneNumber: phoneNumber,
            });
            await item.destroy();
        }

        res.redirect("/");
    } catch (err) {
        console.error("Error creating order:", err);
        res.status(500).send("Error creating order");
    }
});

module.exports = router;
