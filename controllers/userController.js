// controllers/userController.js

class UserController {
  static async getProfile(req, res) {
      return res.render('user/user-profile', { 
          user: req.user,
          success_msg: req.flash('success_msg'),
          error_msg: req.flash('error_msg')
      });
  }

  static async logout(req, res) {
      req.user.status = false;
      await req.user.save();
      req.session.destroy((err) => {
          if (err) {
              console.error('Error destroying session:', err);
          }
          res.redirect('/');
      });
  }

  static async getEditProfileForm(req, res) {
      // Render the edit profile form with the current user data
      return res.render('user/edit-profile', { 
          user: req.user,
          success_msg: req.flash('success_msg'),
          error_msg: req.flash('error_msg')
      });
  }

  static async updateProfile(req, res) {
      try {
          const { name, email, phone } = req.body;
          const user = req.user;

          // Update user details
          user.name = name
          user.phone = phone;

          await user.save();

          // Set success message and redirect to profile page
          req.flash('success_msg', 'Profile updated successfully.');
          return res.redirect('/user/profile');
      } catch (error) {
          console.error('Error updating profile:', error);
          req.flash('error_msg', 'Error updating profile. Please try again.');
          return res.redirect('/user/profile/edit');
      }
  }
}

module.exports = UserController;
