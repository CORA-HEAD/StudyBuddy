const sequelize = require('../config/config');
const { DataTypes, Model } = require('sequelize');

class User extends Model { }

User.init(
    {
        name: {
            type: DataTypes.STRING(120),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(120),
            allowNull: false,
            unique: true // Ensuring that email remains unique in the system
        },
        password: {
            type: DataTypes.STRING(120),
            allowNull: false,
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING(15),
            allowNull: true
        }
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

module.exports = User;
