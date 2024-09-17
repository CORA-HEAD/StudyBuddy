const { Op } = require('sequelize');
const {
    User,
    Course,
    Video,
    Enrollment,
    Review,
    Category,
} = require('../models/associations');
const isAuthenticated = require('../middlewares/is_authenticated');
class courseController {
    static async course(req, res) {
        try {
            const isLoggedIn = req.isAuthenticated();
            const course = await Course.findOne({
                where: { course_id: req.params.course_id },
                include: [
                    { model: Video, as: 'videos' },
                    { model: Category, as: 'category' }
                ]
            });

            if (!course) {
                req.flash('error_msg', 'Course not found');
                return res.redirect('/course'); // Redirect to a course list or other relevant page
                // return res.status(404).send('Course not found');
            }

            // Fetch related courses based on the category
            const relatedCourses = await Course.findAll({
                where: { category_id: course.category_id, course_id: { [Op.ne]: course.course_id } }
            });

            let isEnrolled = false;  // Default to not enrolled
            let hasReviewed = false;  // Default to no review

            if (req.isAuthenticated()) {
                const userId = req.user.id;
                // Check if the user is enrolled in the course
                const enrollment = await Enrollment.findOne({
                    where: {
                        user_id: userId,
                        course_id: course.course_id
                    }
                });

                isEnrolled = !!enrollment;  // Convert the enrollment object to a boolean

                // Check if the user has already submitted a review for this course
                const existingReview = await Review.findOne({
                    where: {
                        user_id: userId,
                        course_id: course.course_id
                    }
                });

                hasReviewed = !!existingReview;  // Convert the review object to a boolean
            }

            // Fetch user reviews for the course
            const reviews = await Review.findAll({
                where: { course_id: course.course_id },
                include: [{ model: User, as: 'user' }]
            });

            // Render the course details, passing enrollment status, review status, and reviews
            res.render('course-detail', { course, relatedCourses, isEnrolled, hasReviewed, reviews, isFree: course.price === '0.00', isLoggedIn });
        } catch (error) {
            req.flash('error_msg', 'Internal Server Error');
            console.error('Error fetching course details:', error);
            res.status(500).send('Internal Server Error');
        }
    };
}
module.exports=courseController;