const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Підключення до бази даних

const Review = sequelize.define("Review", {
    text: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5,
        },
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
    },
});

module.exports = Review;