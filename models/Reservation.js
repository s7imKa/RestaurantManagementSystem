// models/Reservation.js
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // підключення до бази даних

const Reservation = sequelize.define(
    "Reservation",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        customerName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        tableNumber: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        time: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        people: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Pending",
        },
        preOrder: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = Reservation;
