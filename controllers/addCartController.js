const isAuthenticated = require('../middlewares/is_authenticated');
const {Course}=require('../models/associations');
class addCartControlller{
    static async itemAdd (req, res){
        try {
            const user_id = req.user.id; // Assume user is authenticated and `req.user` contains user info
            let course_id = req.body.course_id;  // Extract course_id from the request body
    
            // Convert course_id to a number
            course_id = Number(course_id);
            req.session.course_id = course_id;
            console.log(course_id);
            // Validate that course_id is a valid number
            if (isNaN(course_id)) {
                return res.status(400).send('Invalid course ID');
            }
            // Fetch the course details
            const course = await Course.findByPk(course_id);
    
            if (!course) {
                return res.status(404).send('Course not found');
            }
    
            // If the course is free, enroll the user directly
            if (course.price === '0.00') {
                // Example: If handling an array of course_ids
                let course_ids = [course_id]; // Initialize with the current course_id
                // You could modify this to add more course IDs if needed
                return res.redirect(`/course/enrollments/complete`);
            }
    
            // If the course is paid, add to cart and redirect to cart page
            if (!req.session.cart) {
                req.session.cart = [];
            }
    
            // Check if the course is already in the cart
            if (req.session.cart.find(item => item.course_id === course_id)) {
                return res.status(400).send('Course already in cart');
            }
    
            // Add course to session cart
            req.session.cart.push({
                course_id: course_id,
                title: course.title,
                price: course.price
            });
    
            res.redirect('/cart/view'); // Redirect to the cart page
    
    
        } catch (error) {
            console.error('Error processing cart:', error);
            res.status(500).send('Internal Server Error');
        }
    }   
}
module.exports=addCartControlller;