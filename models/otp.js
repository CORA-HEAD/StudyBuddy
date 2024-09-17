// const sequelize = require('../config/config');
// const { Sequelize, DataTypes } = require('sequelize');
// // const User = require('./users'); // Import the User model

// const OTP = sequelize.define('OTP', {
//     id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true
//     },
//     otp: {
//         type: DataTypes.STRING(4), // Ensure it's a 4-digit string
//         allowNull: false
//     },
//     user_id: {  // Foreign key to reference User
//         type: DataTypes.INTEGER,
//         references: {
//             model: 'users', // 'User' would be the table name in the database
//             key: 'id'
//         },
//         allowNull: false
//     }
// }, {
//     timestamps: true,
//     createdAt: 'created_at',
//     updatedAt: 'updated_at',
//     tableName: 'otp' // Optional: to override the default table name
// });


const sequelize = require('../config/config');
const { DataTypes } = require('sequelize');

// Define the OTP model
const OTP = sequelize.define('OTP', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    otp: {
        type: DataTypes.STRING(4), // 4-digit string
        allowNull: false
    },
    user_email: {  // Link OTP to the user's email, but without a foreign key constraint
        type: DataTypes.STRING(120), // Ensure this matches the User's email field length
        allowNull: false
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    tableName: 'otp' // Optional: To override the default table name 'OTPs'
});

module.exports = OTP;
