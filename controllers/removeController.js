const { Course, Category, Video } = require('../models/associations');

class RemoveController {
    // Controller to show courses for deletion
    static async showCoursesToRemove(req, res) {
        try {
            // Fetch all courses along with associated videos and category
            const courses = await Course.findAll({
                include: [
                    { model: Video, as: 'videos' },
                    { model: Category, as: 'category' }
                ]
            });
            res.render('remove/removeCourses', { courses });
        } catch (error) {
            console.error('Error fetching courses:', error);
            res.status(500).send('Server Error');
        }
    }
    // Controller to remove a course along with its videos
    static async removeCourse(req, res) {
        const { courseId } = req.params;

        try {
            // Find the course by ID
            const course = await Course.findByPk(courseId, {
                include: { model: Video, as: 'videos' }
            });

            if (!course) {
                return res.status(404).send('Course not found');
            }

            // Remove the associated videos first
            await Video.destroy({ where: { course_id: courseId } });

            // Remove the course itself
            await Course.destroy({ where: { course_id: courseId } });

            res.redirect('/admin/remove/courses');
        } catch (error) {
            console.error('Error removing course:', error);
            res.status(500).send('Server Error');
        }
    }

    static async payment(req, res) {
        try {
            const user_id = req.user.id;
            const courseIds = req.body.course_ids;

            if (!courseIds) {
                return res.status(400).send('No courses selected for payment.');
            }

            const normalizedCourseIds = Array.isArray(courseIds) ? courseIds : [courseIds];

            // Fetch courses
            const courses = await Course.findAll({
                where: { course_id: normalizedCourseIds }
            });

            // Prepare line items for Stripe checkout and create individual payments
            const line_items = [];
            for (const course of courses) {
                // Create a separate payment for each course
                const payment = await Payment.create({
                    user_id: user_id,
                    amount: course.price, // Store the individual course price
                    payment_status: 'pending'
                });

                // Insert into the PaymentCourses table
                await PaymentCourses.create({
                    payment_id: payment.payment_id,
                    course_id: course.course_id
                });

                // Prepare line item for Stripe
                line_items.push({
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: course.title,
                            description: course.description,
                        },
                        unit_amount: Math.round(course.price * 100),
                    },
                    quantity: 1,
                });
            }

            // Create Stripe checkout session
            const session = await stripe.checkout.sessions.create({
                line_items: line_items,
                mode: 'payment',
                success_url: `${YOUR_DOMAIN}/cart/success`, // Handle success without payment_id in URL
                cancel_url: `${YOUR_DOMAIN}/cart/cancel`,   // Handle cancel without payment_id in URL
            });

            res.redirect(session.url);

        } catch (error) {
            console.error('Error creating Stripe payment session:', error);
            res.status(500).send('Internal Server Error');
        }
    };
}
module.exports = RemoveController;


