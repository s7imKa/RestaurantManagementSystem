const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Order = sequelize.define("Order", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1, 
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
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "cash",
    },
    paymentStatus: {
        type: DataTypes.STRING,
        defaultValue: "pending",
    }
});

module.exports = Order;
