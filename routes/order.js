const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { isAuthenticated } = require("../middleware/isAuthenticated");
const Dish = require("../models/Dish");
const CartItem = require("../models/CartItem");
const Inventory = require("../models/Inventory");
const { Op } = require("sequelize");

async function deleteOldOrders() {
    try {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate()); 

        // Видаляємо замовлення, створені більше трьох днів тому
        const deletedOrders = await Order.destroy({
            where: {
                createdAt: {
                    [Op.lt]: threeDaysAgo, // Менше ніж три дні тому
                },
            },
        });

        console.log(`Deleted ${deletedOrders} old orders.`);
    } catch (err) {
        console.error("Error deleting old orders:", err);
    }
}
setInterval(() => {
    deleteOldOrders();
}, 24 * 60 * 60 * 1000); // Виконується кожні 24 години


router.get("/", isAuthenticated, (req, res) => {
    const dish = req.query.dish;
    res.render("order", { dish: dish });
});

router.post("/", isAuthenticated, async (req, res) => {
    const {
        customerName,
        dish,
        city,
        street,
        houseNumber,
        apartmentNumber,
        phoneNumber,
        paymentMethod, // Нове поле
        cardNumber,     // Для оплати карткою
        cardExpiry,     // Для оплати карткою
        cardCvv         // Для оплати карткою
    } = req.body;
    const userId = req.user.id;

    const deliveryAddress = `${city}, ${street}, ${houseNumber}, ${apartmentNumber || ""}`;

    try {
        // Створюємо замовлення
        const order = await Order.create({
            userId: userId,
            customerName: customerName,
            dish: dish,
            deliveryAddress: deliveryAddress,
            phoneNumber: phoneNumber,
            paymentMethod: paymentMethod,
            paymentStatus: paymentMethod === 'cash' ? 'completed' : 'pending'
        });

        // Зменшуємо запаси на складі
        const dishData = await Dish.findOne({ where: { name: dish } }); // Знаходимо страву за назвою
        if (dishData) {
            const ingredientsText = dishData.ingredients; // Наприклад: "Тісто, томати, моцарела, базилік"
            const ingredients = ingredientsText.split(",").map(item => item.trim()); // ["Тісто", "томати", "моцарела", "базилік"]

            console.log("Ingredients to process:", ingredients);

            for (const ingredient of ingredients) {
                const product = await Inventory.findOne({ where: { name: ingredient } });
                if (product) {
                    product.stock -= 1;
                    if (product.stock < 0) product.stock = 0;
                    await product.save();
                } else {
                    console.warn(`Product ${ingredient} not found in inventory`);
                }
            }
        } else {
            console.warn(`Dish ${dish} not found in Dish table`);
        }

        // Якщо метод оплати - картка, обробляємо платіж
        if (paymentMethod === 'card') {
            if (cardNumber && cardExpiry && cardCvv) {
                if (cardNumber.length >= 13 && cardNumber.length <= 19) {
                    // Імітація успішної обробки платежу
                    await order.update({ paymentStatus: 'completed' });
                    res.redirect("/");
                } else {
                    await order.update({ paymentStatus: 'failed' });
                    res.status(400).send("Payment failed: Invalid card format");
                }
            } else {
                await order.update({ paymentStatus: 'failed' });
                res.status(400).send("Payment failed: Missing card details");
            }
        } else {
            // Якщо оплата готівкою, просто перенаправляємо
            res.redirect("/");
        }
    } catch (err) {
        console.error("Error creating order:", err);
        res.status(500).send("Error creating order");
    }
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
        paymentMethod, // Нове поле
        cardNumber,     // Для оплати карткою
        cardExpiry,     // Для оплати карткою
        cardCvv         // Для оплати карткою
    } = req.body;
    const userId = req.user.id;

    try {
        const cartItems = await CartItem.findAll({ where: { userId: userId } });
        const deliveryAddress = `${city}, ${street}, ${houseNumber}, ${apartmentNumber || ""}`;

        // Якщо метод оплати - картка, перевіряємо дані картки
        if (paymentMethod === 'card') {
            if (!cardNumber || !cardExpiry || !cardCvv) {
                return res.status(400).send("Payment failed: Missing card details");
            }

            // Проста перевірка формату картки
            if (cardNumber.length < 13 || cardNumber.length > 19) {
                return res.status(400).send("Payment failed: Invalid card format");
            }
        }

        // Створюємо замовлення для кожного товару в кошику
        for (const item of cartItems) {
            // Створюємо замовлення
            await Order.create({
                userId: userId,
                customerName: customerName,
                dish: item.dishName,
                deliveryAddress: deliveryAddress,
                phoneNumber: phoneNumber,
                paymentMethod: paymentMethod,
                paymentStatus: paymentMethod === 'cash' ? 'completed' : 'completed' // Для прикладу завжди completed
            });

            // Зменшуємо запаси на складі
            const dishData = await Dish.findOne({ where: { name: item.dishName } }); // Знаходимо страву за назвою
            if (dishData) {
                const ingredientsText = dishData.ingredients; // Наприклад: "Тісто, томати, моцарела, базилік"
                const ingredients = ingredientsText.split(",").map(item => item.trim()); // ["Тісто", "томати", "моцарела", "базилік"]

                console.log("Ingredients to process:", ingredients);

                for (const ingredient of ingredients) {
                    console.log(`Processing ingredient: ${ingredient}`);
                    const product = await Inventory.findOne({ where: { name: ingredient } });
                    if (product) {
                        product.stock -= 1;
                        if (product.stock < 0) product.stock = 0;
                        await product.save();
                    } else {
                        console.warn(`Product ${ingredient} not found in inventory`);
                    }
                }
            } else {
                console.warn(`Dish ${item.dishName} not found in Dish table`);
            }

            // Видаляємо товар із кошика
            await item.destroy();
        }

        res.redirect("/");
    } catch (err) {
        console.error("Error creating order:", err);
        res.status(500).send("Error creating order");
    }
});

// Маршрут для удаления элемента из корзины
router.post("/cart/:id/remove", isAuthenticated, async (req, res) => {
    try {
        const itemId = req.params.id;
        const userId = req.user.id;
        
        // Находим элемент корзины, убеждаемся, что он принадлежит текущему пользователю
        const cartItem = await CartItem.findOne({
            where: { 
                id: itemId,
                userId: userId
            }
        });
        
        if (!cartItem) {
            return res.status(404).send("Cart item not found or you don't have permission");
        }
        
        // Удаляем элемент из корзины
        await cartItem.destroy();
        
        // Перенаправляем обратно на страницу корзины
        res.redirect("/cart");
    } catch (err) {
        console.error("Error removing item from cart:", err);
        res.status(500).send("Error removing item from cart");
    }
});


module.exports = router;
