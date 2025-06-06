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
    const { dishName, dishPrice, quantity } = req.body;
    const userId = req.user.id;

    console.log("Data received:", { userId, dishName, dishPrice, quantity }); // Логування даних

    try {
        await CartItem.create({
            userId: userId,
            dishName: dishName,
            dishPrice: dishPrice,
            quantity: quantity || 1, // Використовуємо значення за замовчуванням, якщо не передано
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
        paymentMethod,
        cardNumber,
        cardExpiry,
        cardCvv,
    } = req.body;
    const userId = req.user.id;

    try {
        const cartItems = await CartItem.findAll({ where: { userId: userId } });
        const deliveryAddress = `${city}, ${street}, ${houseNumber}, ${apartmentNumber || ""}`;

        // Якщо метод оплати - картка, перевіряємо дані картки
        if (paymentMethod === "card") {
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
                quantity: item.quantity, // Зберігаємо кількість
                deliveryAddress: deliveryAddress,
                phoneNumber: phoneNumber,
                paymentMethod: paymentMethod,
                paymentStatus: paymentMethod === "cash" ? "completed" : "pending",
            });

            // Зменшуємо запаси на складі
            const dishData = await Dish.findOne({ where: { name: item.dishName } });
            if (dishData) {
                const ingredientsText = dishData.ingredients;
                const ingredients = ingredientsText.split(",").map((item) => item.trim());

                console.log("Ingredients to process:", ingredients);

                for (const ingredient of ingredients) {
                    console.log(`Processing ingredient: ${ingredient}`);
                    const product = await Inventory.findOne({ where: { name: ingredient } });
                    if (product) {
                        product.stock -= item.quantity; // Враховуємо кількість
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

// Маршрут для видалення елемента із корзини
router.post("/cart/:id/remove", isAuthenticated, async (req, res) => {
    try {
        const itemId = req.params.id;
        const userId = req.user.id;
        
        //Знаходим елемент корзини для певного користувача
        const cartItem = await CartItem.findOne({
            where: { 
                id: itemId,
                userId: userId
            }
        });
        
        if (!cartItem) {
            return res.status(404).send("Cart item not found or you don't have permission");
        }
        
        
        await cartItem.destroy();
        
        // Перенаправляєм на сторінку корзини
        res.redirect("/cart");
    } catch (err) {
        console.error("Error removing item from cart:", err);
        res.status(500).send("Error removing item from cart");
    }
});

router.post("/cart/:id/update", isAuthenticated, async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    try {
        // Перевіряємо, чи кількість є валідною
        if (quantity <= 0) {
            return res.status(400).send("Quantity must be greater than 0");
        }

        // Оновлюємо кількість у базі даних
        const cartItem = await CartItem.findByPk(id);
        if (cartItem) {
            cartItem.quantity = quantity;
            await cartItem.save();
            console.log("Cart item updated:", cartItem.quantity); 
            return res.redirect("/cart"); // Перенаправлення після успішного оновлення
        } else {
            return res.status(404).send("Cart item not found");
        }
    } catch (err) {
        console.error("Error updating cart item:", err);
        return res.status(500).send("Error updating cart item");
    }
});


module.exports = router;
