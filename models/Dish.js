const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Dish = sequelize.define("Dish", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    ingredients: {
        type: DataTypes.TEXT,
    },
    imageUrl: {
        type: DataTypes.BLOB, // Change this line
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
    },
    available: {
        type: DataTypes.BOOLEAN,
    },
    category: {
        type: DataTypes.STRING, // Наприклад: "Супи", "Піца", "Напої", "Алкоголь"
        allowNull: false,
    },
});

module.exports = Dish;
