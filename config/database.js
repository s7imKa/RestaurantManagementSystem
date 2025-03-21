const { Sequelize } = require('sequelize');

// Налаштування підключення до бази даних MySQL
const sequelize = new Sequelize('restaurant', 'root', '2005', {
  host: 'localhost',
  dialect: 'mysql'
});

// Перевірка підключення
sequelize.authenticate()
  .then(() => console.log('Connected to MySQL'))
  .catch(err => console.log('Error connecting to MySQL:', err));

module.exports = sequelize;
