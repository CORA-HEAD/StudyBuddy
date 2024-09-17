const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const Course = sequelize.define('Course', {
    course_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    image_path: {
        type: DataTypes.STRING,
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00 // Default to 0.00 if not provided for free course
    },
    level: {
        type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'), // Add the level field with predefined values
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    category_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'categories',
            key: 'category_id'
        },
        onDelete: 'SET NULL',
        allowNull: true
    }
}, {
    tableName: 'Courses',
    timestamps: false
});
module.exports = Course;
    