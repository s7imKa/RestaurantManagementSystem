const Order = require("../models/Order");
const Reservation = require("../models/Reservation");
const Dish = require("../models/Dish");
const Inventory = require("../models/Inventory");
const multer = require("multer");
const path = require("path");
// Список категорій
const categories = ["Супи", "Піца", "Напої", "Алкоголь"];

// Налаштування для multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images/"); // Папка для збереження файлів
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname); // Отримуємо розширення файлу
        cb(null, uniqueSuffix + extension); // Генеруємо ім'я файлу з розширенням
    },
});

const upload = multer({ storage: storage });

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
        res.render("reservations", { reservations: reservations });
    } catch (err) {
        console.error("Error fetching reservations:", err);
        res.status(500).send("Error fetching reservations");
    }
};

exports.getDishes = async (req, res) => {
    try {
        const dishes = await Dish.findAll();
        res.render("dishes", { dishes, categories });
    } catch (err) {
        console.error("Error fetching dishes:", err);
        res.status(500).send("Error fetching dishes");
    }
};

exports.addDish = [
    upload.single("imageUrl"),
    async (req, res) => {
        const { name, description, ingredients, price, category, available } = req.body;
        const imageUrl = req.file ? `/images/${req.file.filename}` : null;

        try {
            // Додаємо нову страву
            await Dish.create({
                name,
                description,
                ingredients,
                imageUrl,
                price,
                category,
                available: available === "on" ? true : false,
            });



            // Обробляємо інгредієнти
            const ingredientList = ingredients.split(",").map(item => item.trim());

            for (const ingredient of ingredientList) {
                const existingProduct = await Inventory.findOne({ where: { name: ingredient } });
                if (!existingProduct) {
                    const randomMaxStock = Math.floor(Math.random() * (180 - 100 + 1)) + 100;

                    await Inventory.create({
                        name: ingredient,
                        stock: 0,
                        minStock: 10,
                        maxStock: randomMaxStock,
                    });
                } else {
                    console.log(`Ingredient "${ingredient}" already exists in Inventory.`);
                }
            }

            // Якщо категорія нова, додаємо її до масиву
            if (!categories.includes(category)) {
                categories.push(category);
                console.log(`New category "${category}" added.`);
            }

            res.redirect("/admin/dishes");
        } catch (err) {
            console.error("Error adding dish:", err);
            res.status(500).send("Error adding dish");
        }
    },
];

exports.deleteDish = async (req, res) => {
    const dishId = req.params.id;

    try {
        // Знаходимо страву, яку потрібно видалити
        const dish = await Dish.findByPk(dishId);

        if (!dish) {
            return res.status(404).send("Dish not found");
        }

        // Отримуємо список інгредієнтів із страви
        const ingredientList = dish.ingredients.split(",").map(item => item.trim());

        // Видаляємо інгредієнти з таблиці inventories
        for (const ingredient of ingredientList) {
            await Inventory.destroy({
                where: {
                    name: ingredient,
                },
            });
        }

        // Видаляємо саму страву
        await Dish.destroy({
            where: {
                id: dishId,
            },
        });

        res.redirect("/admin/dishes"); // Повертаємося до списку страв
    } catch (err) {
        console.error("Error deleting dish:", err);
        res.status(500).send("Error deleting dish");
    }
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
