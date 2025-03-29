const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Inventory = sequelize.define("Inventory", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    minStock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30,
    },
    maxStock: { // Додаємо нову колонку
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100, // Значення за замовчуванням
    },
}, {
    timestamps: true, // Додає поля createdAt і updatedAt
});

module.exports = Inventory;