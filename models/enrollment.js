const { DataTypes } = require('sequelize');
const sequelize = require('../config/config'); // Adjust the path to your database config
// const Course = require('./courses');  
// const User = require('./users');
const Enrollment = sequelize.define('Enrollment', {
  enrollment_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // 'Users' would be the table name
      key: 'user_id',
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
  enrolled_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'Enrollments',
  timestamps: false,
});
module.exports = Enrollment;
