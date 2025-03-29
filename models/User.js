const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const bcrypt = require("bcryptjs");
const CartItem = require("./CartItem");

const User = sequelize.define( "User",
    {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        hooks: {
            beforeCreate: async (user) => {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            },
        },
        instanceMethods: {
            validPassword: async function (password) {
                return await bcrypt.compare(password, this.password);
            },
        },
    }
);

User.prototype.validPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

User.hasMany(CartItem);
CartItem.belongsTo(User);

module.exports = User;
