const { User, Course, Enrollment } = require('../models/associations');
class enrollmentController {
  static async createEnrollment(req, res) {
    try {
      const user_id = req.user.id;
      const course_ids = req.session.course_ids || [req.session.course_id];
      // console.log(course_ids);

      if (!course_ids || course_ids.length === 0) {
        return res.status(400).json({ message: 'No courses to enroll in.' });
      }

      for (const course_id of course_ids) {
        // Check if the course exists
        const course = await Course.findByPk(course_id);
        if (!course) {
          console.log('Course not found:', course_id);
          return res.status(404).json({ message: `Course not found for ID: ${course_id}` });
        }

        // Check if the user is already enrolled
        const existingEnrollment = await Enrollment.findOne({ where: { user_id, course_id } });
        if (existingEnrollment) {
          console.log('Already enrolled:', { user_id, course_id });
          continue;  // Skip to the next course if already enrolled
        }

        // Create a new enrollment
        await Enrollment.create({ user_id, course_id });
      }


      // Redirect to the course page with a success message
      res.status(201).render('enrollment-success', {
        message: 'Enrollment successful!',
        user_id: user_id,
        course_ids: course_ids
      });

      // Clear the session data after processing
      req.session.course_ids = null;
      req.session.course_id = null;
    } catch (error) {
      console.error('Error occurred:', error);
      res.status(500).json({ error: 'Failed to enroll in the courses.' });
    }
  }

  static async getAllEnrollments(req, res) {
    try {
      const isLoggedIn = req.isAuthenticated();
      const userId = req.user.id;

      // Find all enrollments for the user
      const enrollments = await Enrollment.findAll({
        where: { user_id: userId },
        include: [
          { model: User, attributes: ['name', 'email'] },
          { model: Course, attributes: ['title', 'description'] }
        ]
      });

      // Render the EJS view with the enrollments data
      res.render('enrollment-details', { enrollments, isLoggedIn });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  static async deleteEnrollment(req, res) {
    try {
      const { id } = req.params;
      const enrollment = await Enrollment.findByPk(id);

      if (!enrollment) {
        return res.status(404).json({ message: 'Enrollment not found' });
      }

      await enrollment.destroy();
      return res.status(200).json({ message: 'Enrollment deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}
module.exports=enrollmentController;