const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { isAuthenticated } = require("../middleware/isAuthenticated");
const { isAdmin } = require("../middleware/isAdmin");
const Order = require("../models/Order");
const Reservation = require("../models/Reservation");
const Inventory = require("../models/Inventory");
const Invoice = require("../models/Invoice"); // Імпортуємо модель Invoice

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

// Маршрут для перегляду складу
router.get("/inventory", isAdmin, async (req, res) => {
    try {
        const inventory = await Inventory.findAll();
        const invoices = await Invoice.findAll({
            order: [["processedAt", "DESC"]],
        }); // Отримуємо історію накладних
        res.render("inventory", { inventory: inventory, invoices: invoices }); // Передаємо invoices
    } catch (err) {
        console.error("Error fetching inventory:", err);
        res.status(500).send("Error fetching inventory");
    }
});

// Маршрут для оновлення запасів
router.post("/inventory/update", isAdmin, async (req, res) => {
    try {
        const restockData = req.body.restock; // Отримуємо дані з форми
        if (!restockData || Object.keys(restockData).length === 0) {
            throw new Error("No restock data received");
        }

        console.log("Restock data:", Object.entries(restockData)); // Логування отриманих даних

        for (const [name, amount] of Object.entries(restockData)) {
            console.log(`Processing restock for product name: ${name}, amount: ${amount}`);

            if (amount > 0) {
                // Знаходимо продукт за його ім'ям
                const product = await Inventory.findOne({ where: { name: name } });
                if (product) {
                    const newStock = product.stock + parseInt(amount, 10); // Обчислюємо новий запас
                    if (newStock > 300) {
                        message += `Cannot add product "${product.name}" from invoice. Stock would exceed 300 units.<br>`;
                        continue; // Пропускаємо оновлення, якщо перевищує 300
                    }

                    product.stock = newStock; // Оновлюємо запас
                    await product.save();
                } else {
                    console.error(`Product with name "${name}" not found in inventory.`);
                }
            }
        }

        res.redirect("/admin/inventory");
    } catch (err) {
        console.error("Error updating inventory:", err);
        res.status(500).send("Error updating inventory");
    }
});

router.post("/inventory/process", isAdmin, async (req, res) => {
    try {
        const invoiceData = req.body.invoice || {}; // Дані для обробки накладної
        console.log("Invoice data:", invoiceData);

        let message = ""; // Ініціалізуємо змінну для повідомлень

        // Обробка накладної
        for (const [name, amount] of Object.entries(invoiceData)) {
            console.log(`Processing invoice for product name: ${name}, amount: ${amount}`);

            if (amount > 0) {
                // Знаходимо продукт за його ім'ям
                const product = await Inventory.findOne({ where: { name: name } });
                if (product) {
                    const newStock = product.stock + parseInt(amount, 10); // Обчислюємо новий запас
                    if (newStock > 300) {
                        message += `Cannot add product "${product.name}" from invoice. Stock would exceed 300 units.<br>`;
                        continue; // Пропускаємо оновлення, якщо перевищує 300
                    }

                    product.stock = newStock; // Оновлюємо запас
                    await product.save();

                    // Зберігаємо запис у таблиці Invoice
                    await Invoice.create({
                        productName: name,
                        amount: parseInt(amount, 10),
                    });
                } else {
                    message += `Product with name "${name}" not found in inventory.<br>`;
                }
            }
        }

        const inventory = await Inventory.findAll(); // Оновлений список товарів
        const invoices = await Invoice.findAll({
            order: [["processedAt", "DESC"]],
        }); // Отримуємо історію накладних
        
        res.render("inventory", {
            inventory: inventory,
            invoices: invoices, // Передаємо invoices
            message: message || "Invoice processed successfully.",
        });
    } catch (err) {
        console.error("Error processing invoice:", err);
        res.status(500).render("inventory", {
            inventory: await Inventory.findAll(),
            message: "An error occurred while processing the invoice.",
        });
    }
});


router.post("/admin/deleteOrder/:id", isAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        // Видаляємо замовлення з бази даних
        await Order.destroy({
            where: {
                id: id,
            },
        });
        res.redirect("/admin/orders"); // Повертаємося до сторінки замовлень
    } catch (err) {
        console.error("Error deleting order:", err);
        res.status(500).send("Error deleting order");
    }
});

module.exports = router;
