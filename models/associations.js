// associations.js
const User = require('./users');
const Course = require('./courses');
const Video = require('./video');
const Enrollment = require('./enrollment');
const Review = require('./reviews');
const Payment = require('./payments');
const PaymentCourses = require('./paymentCourses');
const OTP = require('./otp');
const Category = require('./categories');
const Admin = require('./admin');
const PasswordReset = require('./PasswordReset');

// Define associations

// User associations
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Enrollment, { foreignKey: 'user_id' });
Enrollment.belongsTo(User, { foreignKey: 'user_id' });

// User.hasMany(OTP, { foreignKey: 'user_id' });
// OTP.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(OTP, { foreignKey: 'user_email', sourceKey: 'email' });
OTP.belongsTo(User, { foreignKey: 'user_email', targetKey: 'email' });

User.hasMany(Payment, { foreignKey: 'user_id' });
Payment.belongsTo(User, { foreignKey: 'user_id' });


// Course associations
Course.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Course, { foreignKey: 'category_id', as: 'courses' });

Course.hasMany(Enrollment, { foreignKey: 'course_id' });
Enrollment.belongsTo(Course, { foreignKey: 'course_id' });

Course.hasMany(Video, { foreignKey: 'course_id', as: 'videos' });
Video.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

Course.hasMany(Review, { foreignKey: 'course_id', as: 'reviews' });
Review.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });


// Payment associations
Payment.belongsToMany(Course, {
  through: PaymentCourses,
  foreignKey: 'payment_id',
  otherKey: 'course_id'
});
Course.belongsToMany(Payment, {
  through: PaymentCourses,
  foreignKey: 'course_id',
  otherKey: 'payment_id'
});

// Define associations
User.hasMany(PasswordReset, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
});

PasswordReset.belongsTo(User, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
});

// Export the models with associations
module.exports = {
  User,
  Course,
  Video,
  Enrollment,
  Review,
  Payment,
  PaymentCourses,
  OTP,
  Category,
  Admin,
  PasswordReset
};
