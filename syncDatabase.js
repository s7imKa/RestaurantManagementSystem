const sequelize = require('./config/database');
// Імпортуємо всі моделі
require('./models/User');
require('./models/Session');
require('./models/Review');
require('./models/Reservation');
require('./models/Order');
require('./models/Inventory');
require('./models/Dish');
require('./models/CartItem');

(async () => {
    try {
        // Синхронізація моделей з базою даних
        await sequelize.sync({ force: true }); // Використовуйте { alter: true } для оновлення без видалення
        console.log('Всі таблиці успішно створені!');
    } catch (error) {
        console.error('Помилка при створенні таблиць:', error);
    } finally {
        await sequelize.close();
    }
})();

