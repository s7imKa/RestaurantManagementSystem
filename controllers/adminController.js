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

exports.getReservations = async (req, res) => {
    try {
        const reservations = await Reservation.findAll();
        console.log(`wjindfeiw${reservations}`);
        res.render("reservations", { reservations: reservations });
    } catch (err) {
        console.error("Error fetching reservations:", err);
        res.status(500).send("Error fetching reservations");
    }
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

exports.addDish = [
    upload.single("imageUrl"),
    (req, res) => {
        const { name, description, ingredients, price, available } = req.body;
        const imageUrl = req.file ? req.file.path : null;

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
    },
];

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

exports.updateOrderStatus = async () => {
    try {
        const ordersToUpdate = await Order.findAll({
            where: { status: "Pending" },
        });
        for (const order of ordersToUpdate) {
            const createdAt = new Date(order.createdAt);
            const now = new Date();
            const diff = now.getTime() - createdAt.getTime();
            const minutes = Math.floor(diff / 60000);

            if (minutes >= 5) {
                order.status = "Processing";
                await order.save();
                console.log(`Order status updated for order ID: ${order.id}`);
            }
        }
    } catch (error) {
        console.error("Error updating order status:", error);
    }
};

exports.getOrders = async (req, res) => {
    try {
        await exports.updateOrderStatus(); // Call the function from the controller
        const orders = await Order.findAll({
            order: [["createdAt", "DESC"]], // Sort by createdAt in descending order
        });
        res.render("orders", { orders: orders });
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).send("Error fetching orders");
    }
};
