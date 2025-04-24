require('dotenv').config();
const { Sequelize } = require('sequelize');

// Налаштування підключення до бази даних MySQL
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: false,
    dialectOptions: {
        charset: 'utf8mb4',
    },
    define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
    },
});

// Перевірка підключення
sequelize.authenticate()
  .then(() => console.log('Connected to MySQL  ✅'))
  .catch(err => console.log('Error connecting to MySQL:', err));

module.exports = sequelize;
