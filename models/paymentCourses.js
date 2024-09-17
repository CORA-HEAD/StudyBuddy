const sequelize = require('../config/config');
const { DataTypes } = require('sequelize');
const PaymentCourses = sequelize.define('PaymentCourses', {
    payment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true, // Make this part of the composite primary key
      references: {
        model:'payments',
        key: 'payment_id',
      },
      onDelete: 'CASCADE',
    },
    course_id: {
      type: DataTypes.INTEGER,
      primaryKey: true, // Make this part of the composite primary key
      references: {
        model: 'courses',
        key: 'course_id',
      },
      onDelete: 'CASCADE',
    },
  }, {
    tableName: 'PaymentCourses',
    timestamps: false,
  });
module.exports=PaymentCourses;  