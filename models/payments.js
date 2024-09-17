const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const Payment = sequelize.define('Payment', {
  payment_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id',
    },
    onDelete: 'CASCADE',
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  payment_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    allowNull: false,
  },
}, {
  tableName: 'Payments',
  timestamps: false,
});

module.exports = Payment;
