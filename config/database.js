require('dotenv').config();
const { Sequelize } = require('sequelize');

// Налаштування підключення до бази даних MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false, // Add this line
  }
);

// Перевірка підключення
sequelize.authenticate()
  .then(() => console.log('Connected to MySQL  ✅'))
  .catch(err => console.log('Error connecting to MySQL:', err));

module.exports = sequelize;
