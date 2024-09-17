const {Review} = require('../models/associations');

class reviewController {
    static async review(req, res) {
        try {
            const { course_id, rating, review } = req.body;
            const user_id = req.user.id; // Assuming user is authenticated and `req.user` contains the user details
            // Save the review to the database
            await Review.create({
                course_id,
                user_id,
                rating,
                review,
                created_at: new Date()
            });

            // Redirect back to the course page
            res.redirect(`/course/${course_id}`);
        } catch (error) {
            console.error('Error saving review:', error);
            res.status(500).send('An error occurred while saving the review.');
        }
    }
}
module.exports = reviewController;