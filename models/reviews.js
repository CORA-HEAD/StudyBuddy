const { DataTypes } = require('sequelize');
const sequelize = require('../config/config'); // Adjust the path to your database config

const Review = sequelize.define('Review', {
  review_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // 'users' is the correct table name for User model
      key: 'id',      // Default primary key in Sequelize is 'id'
    },
    onDelete: 'CASCADE',
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'courses', // 'Courses' would be the table name
      key: 'course_id',
    },
    onDelete: 'CASCADE',
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  review: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'Reviews',
  timestamps: false,
});

module.exports = Review;
