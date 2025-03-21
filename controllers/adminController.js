const Order = require("../models/Order");
const Reservation = require("../models/Reservation");
const Dish = require("../models/Dish");
const multer = require("multer");
const upload = multer({ dest: "public/images/" });

exports.getAdminDashboard = (req, res) => {
    res.render("admin");
};

exports.getOrders = (req, res) => {
    Order.findAll()
        .then((orders) => {
            res.render("orders", { orders: orders });
        })
        .catch((err) => {
            console.error("Error fetching orders:", err);
            res.status(500).send("Error fetching orders");
        });
};

exports.getReservations = (req, res) => {
    Reservation.findAll()
        .then((reservations) => {
            res.render("reservations", { reservations });
        })
        .catch((err) => res.status(500).send("Error fetching reservations"));
};

exports.getDishes = (req, res) => {
    Dish.findAll()
        .then((dishes) => {
            res.render("dishes", { dishes: dishes });
        })
        .catch((err) => {
            console.error("Error fetching dishes:", err);
            res.status(500).send("Error fetching dishes");
        });
};

exports.addDish = (req, res) => {
    const { name, description, ingredients, imageUrl, price, available } =
        req.body;

    Dish.create({
        name: name,
        description: description,
        ingredients: ingredients,
        imageUrl: imageUrl,
        price: price,
        available: available === "on" ? true : false,
    })
        .then(() => {
            res.redirect("/admin/dishes");
        })
        .catch((err) => {
            console.error("Error adding dish:", err);
            res.status(500).send("Error adding dish");
        });
};

exports.deleteDish = (req, res) => {
    const dishId = req.params.id;

    Dish.destroy({
        where: {
            id: dishId,
        },
    })
        .then(() => {
            res.redirect("/admin/dishes");
        })
        .catch((err) => {
            console.error("Error deleting dish:", err);
            res.status(500).send("Error deleting dish");
        });
};

exports.updateOrder = (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;

    Order.update(
        { status: status },
        {
            where: {
                id: orderId,
            },
        }
    )
        .then(() => {
            res.redirect("/admin/orders");
        })
        .catch((err) => {
            console.error("Error updating order:", err);
            res.status(500).send("Error updating order");
        });
};
