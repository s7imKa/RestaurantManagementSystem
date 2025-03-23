const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CartItem = sequelize.define("CartItem", {
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    dishName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    dishPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false, // Add this line
    },
});

module.exports = CartItem;
