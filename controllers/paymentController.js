const {
    Course,
    Payment,
    PaymentCourses,
} = require('../models/associations');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const YOUR_DOMAIN = process.env.YOUR_DOMAIN;
class paymentController {
    static async view(req, res) {
        try {
            const isLoggedIn = req.isAuthenticated();
            console.log(isLoggedIn);
            const user_id = req.user.id;
            if (!req.session.cart || req.session.cart.length === 0) {
                return res.render('cart', { courses: [], totalAmount: 0, isLoggedIn });
            }

            const course_ids = req.session.cart.map(item => item.course_id);

            // Fetch course details
            const courses = await Course.findAll({
                where: {
                    course_id: course_ids
                }
            });

            // Calculate total amount
            const totalAmount = req.session.cart.reduce((total, item) => total + parseFloat(item.price), 0);

            // Render the cart page with course details and total amount
            res.render('cart', {
                isLoggedIn,
                courses: courses,
                cart: req.session.cart,
                totalAmount: totalAmount,
            });


        } catch (error) {
            console.error('Error viewing cart:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    static async remove(req, res) {
        try {
            const course_id = Number(req.body.course_id);

            if (isNaN(course_id)) {
                return res.status(400).send('Invalid course ID');
            }

            // Remove the course from the session cart
            req.session.cart = req.session.cart.filter(item => item.course_id !== course_id);

            res.redirect('/cart/view');
        } catch (error) {
            console.error('Error removing course from cart:', error);
            res.status(500).send('Internal Server Error');
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
    }

    static async success(req, res) {
        try {
            const user_id = req.user.id;

            // Update all pending payments for the user to 'completed'
            await Payment.update(
                { payment_status: 'completed' },
                { where: { user_id, payment_status: 'pending' } }
            );

            // Find all courses associated with the completed payments
            const completedPayments = await Payment.findAll({
                where: { user_id, payment_status: 'completed' },
                attributes: ['payment_id'],
            });

            const payment_ids = completedPayments.map(payment => payment.payment_id);

            const paymentCourses = await PaymentCourses.findAll({
                where: { payment_id: payment_ids },
                attributes: ['course_id']
            });

            const course_ids = paymentCourses.map(pc => pc.course_id);

            // Store the course IDs in the session or pass them as query parameters
            req.session.course_ids = course_ids;

            // Clear the cart after successful payment
            req.session.cart = [];


            // Redirect to the enrollment completion route
            res.redirect('/course/enrollments/complete');
        } catch (error) {
            console.error('Error handling payment success:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    static async cancel(req, res) {
        try {
            const user_id = req.user.id;

            // Update all pending payments for the user to 'failed'
            await Payment.update(
                { payment_status: 'failed' },
                { where: { user_id, payment_status: 'pending' } }
            );

            res.redirect('/cart/view');
        } catch (error) {
            console.error('Error handling payment cancellation:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}
module.exports = paymentController;