const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Order = sequelize.define("Order", {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    customerName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    dish: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    deliveryAddress: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: "Pending",
    },
});

module.exports = Order;
