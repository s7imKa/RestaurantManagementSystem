const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { isAuthenticated } = require("../middleware/isAuthenticated");
const { isAdmin } = require("../middleware/isAdmin");
const Order = require("../models/Order");
const Reservation = require("../models/Reservation");

router.use(isAuthenticated);

router.use((req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).send("Unauthorized");
    }
});

router.get("/", isAdmin, (req, res) => {
    res.render("admin");
});

router.get("/orders", isAdmin, async (req, res) => {
    try {
        // Update order statuses
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
            }
        }

        const orders = await Order.findAll({
            order: [["createdAt", "DESC"]], // Sort by createdAt in descending order
        });
        res.render("orders", { orders: orders });
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).send("Error fetching orders");
    }
});

router.get("/reservations", adminController.getReservations);
router.get("/dishes", adminController.getDishes);
router.post("/addDish", adminController.addDish);
router.post("/deleteDish/:id", adminController.deleteDish);

router.post("/updateOrder/:id", isAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const order = await Order.findByPk(id);
        if (order) {
            order.status = status;
            await order.save();
            res.redirect("/admin/orders");
        } else {
            res.status(404).send("Order not found");
        }
    } catch (err) {
        console.error("Error updating order:", err);
        res.status(500).send("Error updating order");
    }
});

router.post("/reservations/cancel/:id", isAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        await Reservation.destroy({
            where: {
                id: id,
            },
        });
        res.redirect("/admin/reservations");
    } catch (err) {
        console.error("Error cancelling reservation:", err);
        res.status(500).send("Error cancelling reservation");
    }
});

module.exports = router;
