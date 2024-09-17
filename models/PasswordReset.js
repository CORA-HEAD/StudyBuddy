// models/PasswordReset.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/config'); // Adjust path as needed

class PasswordReset extends Model {}

PasswordReset.init({
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // Name of the User table
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'PasswordReset',
    tableName: 'password_resets',
    timestamps: false, // Disable createdAt/updatedAt as we have `expires_at`
});

module.exports = PasswordReset;
