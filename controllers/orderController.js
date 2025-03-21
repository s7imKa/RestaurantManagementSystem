const Order = require("../models/Order");

exports.getOrderForm = (req, res) => {
    const dish = req.query.dish;
    res.render("order", { dish: dish });
};

exports.placeOrder = (req, res) => {
    const { customerName, dish, deliveryAddress, phoneNumber } = req.body;

    console.log("Creating order with:", {
        customerName,
        dish,
        deliveryAddress,
        phoneNumber,
    }); // Отладочный вывод

    Order.create({ customerName, dish, deliveryAddress, phoneNumber })
        .then(() => res.redirect("/"))
        .catch((err) => {
            console.error("Error placing order:", err); // Отладочный вывод
            res.status(500).send("Error placing order");
        });
};

exports.getOrders = (req, res) => {
    Order.findAll()
        .then((orders) => res.render("orders", { orders }))
        .catch((err) => res.status(500).send("Error fetching orders"));
};
