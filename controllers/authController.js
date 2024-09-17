const { User, OTP, Admin, PasswordReset } = require("../models/associations");
const bcrypt = require('bcrypt'); //admin //user
const nodemailer = require("nodemailer");
const twilio = require("twilio");
require('dotenv').config(); // Require dotenv to use environment variables
const sequelize = require('../config/config'); // Adjust the path to your sequelize instance
const axios = require('axios');  //admin
// const router = require("../routes/uploadRoutes");
const crypto = require('crypto');
class AuthUser {
    static async showLoginForm(req, res) {
        return res.render('auth_User/login');
    }

    static async showSignupForm(req, res) {
        return res.render('auth_User/signup');
    }

    static async login(req, res) {
        try {
            const email = req.body.email;
            const user = await User.findOne({ where: { email: email } });

            if (user) {
                // Generate a new OTP
                const otp = Math.floor((Math.random() * 9000) + 1000);

                // Update or create OTP associated with the user's email
                await OTP.update(
                    { otp: otp.toString() },
                    { where: { user_email: user.email } }
                );

                // If no OTP record exists, create a new one
                const [updatedOTP, created] = await OTP.findOrCreate({
                    where: { user_email: user.email },
                    defaults: { otp: otp.toString() }
                });

                // const accountSid = process.env.TWILIO_ACCOUNT_SID;
                // const authToken = process.env.TWILIO_AUTH_TOKEN;
                // const client = require('twilio')(accountSid, authToken);

                // await client.messages.create({
                //     body: `Your OTP is ${otp}`,
                //     from: process.env.TWILIO_PHONE_NUMBER,
                //     to: process.env.TWILIO_RECIPIENT_NUMBER
                // });

                req.session.email = email;
                req.flash('success_msg', 'OTP has been sent to your phone!');
                // return res.redirect('/auth/verifySms'); for not use the sms temp
                return res.redirect("/");
            } else {
                console.log("User not found during login");
                // req.flash('error_msg', 'User not found. Please check your email and try again.');
                return res.redirect('/auth/login');
            }
        } catch (error) {
            console.error("Error during login:", error);
            // req.flash('error_msg', 'An error occurred. Please try again later.');
            return res.redirect('/auth/login');
        }
    }


    // Signup Method with Email OTP

    //     static async signup(req, res) {
    //         const transaction = await sequelize.transaction(); // Start a transaction

    //         try {
    //             const data = req.body;
    //             const existingUser = await User.findOne({ where: { email: data.email } });
    //             if (existingUser) {
    //                 req.flash('error_msg', 'Email already exists!');
    //                 return res.redirect('/auth/signup');
    //             }
    //             // Generate OTP
    //             const otp = Math.floor((Math.random() * 9000) + 1000);

    //             // Store OTP in the database
    //             await OTP.create({
    //                 otp: otp.toString(),
    //                 user_email: data.email // Link OTP to email
    //             }, { transaction }); // Pass transaction to the create method

    //             // Store user data in session for later use after OTP verification
    //             req.session.tempUserData = {
    //                 name: data.name,
    //                 email: data.email,
    //                 password: await bcrypt.hash(data.password, 10), // Hash the password
    //                 phone: data.phone
    //             };

    //             // Configure and send OTP via email
    //             const transporter = nodemailer.createTransport({
    //                 service: 'gmail',
    //                 auth: {
    //                     user: process.env.EMAIL_USER,
    //                     pass: process.env.EMAIL_PASS, // Use environment variables for sensitive data
    //                 },
    //             });

    //             await transporter.sendMail({
    //                 from: `"StudyBuddy" <${process.env.EMAIL_USER}>`,
    //                 to: data.email,
    //                 subject: "StudyBuddy Email Verification",
    //                 html: `
    //     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    //         <h2 style="color: #007bff; text-align: center;">Welcome to StudyBuddy!</h2>
    //         <p>Dear User,</p>
    //         <p>Thank you for registering with StudyBuddy. To complete your registration, please verify your email by entering the following One-Time Password (OTP) on the verification page:</p>
    //         <h3 style="background-color: #f1f1f1; padding: 10px; text-align: center; border-radius: 5px; border: 1px solid #ccc;">${otp}</h3>
    //         <p style="font-weight: bold;">Please do not share this code with anyone.</p>
    //         <p>If you did not initiate this request, please contact our support team immediately.</p>
    //         <br>
    //         <p>Best Regards,</p>
    //         <p>The StudyBuddy Team</p>
    //         <p style="font-size: 12px; color: #555;">This is an automated message; please do not reply directly to this email.</p>
    //     </div>
    // `,

    //             });

    //             await transaction.commit(); // Commit the transaction

    //             req.flash('success_msg', 'Registration successful! Please verify your email.');
    //             return res.redirect('/auth/verify');
    //         } catch (error) {
    //             await transaction.rollback(); // Rollback the transaction on error
    //             console.error("Error during signup:", error);
    //             req.flash('error_msg', 'Something went wrong. Please try again.');
    //             return res.redirect('/auth/signup');
    //         }
    //     }
    static async signup(req, res) {
        const transaction = await sequelize.transaction(); // Start a transaction

        try {
            const data = req.body;
            const existingUser = await User.findOne({ where: { email: data.email } });

            if (existingUser) {
                req.flash('error_msg', 'Email already exists!');
                return res.redirect('/auth/signup');
            }

            // Generate OTP
            const otp = Math.floor((Math.random() * 9000) + 1000);

            // Check if OTP record already exists for the email
            const existingOTP = await OTP.findOne({ where: { user_email: data.email } });

            if (existingOTP) {
                // If an OTP record exists, update it
                await OTP.update(
                    { otp: otp.toString() },
                    { where: { user_email: data.email }, transaction }
                );
            } else {
                // If no OTP record exists, create a new one
                await OTP.create({
                    otp: otp.toString(),
                    user_email: data.email // Link OTP to email
                }, { transaction });
            }

            // Store user data in session for later use after OTP verification
            req.session.tempUserData = {
                name: data.name,
                email: data.email,
                password: await bcrypt.hash(data.password, 10), // Hash the password
                phone: data.phone
            };

            // Configure and send OTP via email
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS, // Use environment variables for sensitive data
                },
            });

            await transporter.sendMail({
                from: `"StudyBuddy" <${process.env.EMAIL_USER}>`,
                to: data.email,
                subject: "StudyBuddy Email Verification",
                html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #007bff; text-align: center;">Welcome to StudyBuddy!</h2>
        <p>Dear User,</p>
        <p>Thank you for registering with StudyBuddy. To complete your registration, please verify your email by entering the following One-Time Password (OTP) on the verification page:</p>
        <h3 style="background-color: #f1f1f1; padding: 10px; text-align: center; border-radius: 5px; border: 1px solid #ccc;">${otp}</h3>
        <p style="font-weight: bold;">Please do not share this code with anyone.</p>
        <p>If you did not initiate this request, please contact our support team immediately.</p>
        <br>
        <p>Best Regards,</p>
        <p>The StudyBuddy Team</p>
        <p style="font-size: 12px; color: #555;">This is an automated message; please do not reply directly to this email.</p>
    </div>
`,

            });

            await transaction.commit(); // Commit the transaction

            req.flash('success_msg', 'Registration successful! Please verify your email.');
            return res.redirect('/auth/verify');
        } catch (error) {
            await transaction.rollback(); // Rollback the transaction on error
            console.error("Error during signup:", error);
            req.flash('error_msg', 'Something went wrong. Please try again.');
            return res.redirect('/auth/signup');
        }
    }



    static async showVerifyPage(req, res) {
        return res.render('auth_User/verify');
    }


    static async verify(req, res) {
        const transaction = await sequelize.transaction(); // Start a transaction

        try {
            const data = req.body;
            const email = req.session.tempUserData?.email;

            if (!email) {
                req.flash('error_msg', 'Session expired. Please sign up again.');
                return res.redirect('/auth/signup');
            }

            // Find the OTP associated with the email
            const otpRecord = await OTP.findOne({ where: { user_email: email } });

            if (!otpRecord) {
                req.flash('error_msg', 'No OTP found for this email!');
                return res.redirect('/auth/verify');
            }

            // Compare the OTP entered by the user with the one in the database
            if (data.otp === otpRecord.otp) {
                // Create the user only after OTP verification
                await User.create({
                    name: req.session.tempUserData.name,
                    email: req.session.tempUserData.email,
                    password: req.session.tempUserData.password,
                    phone: req.session.tempUserData.phone,
                    status: false
                }, { transaction }); // Pass transaction to the create method

                // Optionally, delete the OTP after successful verification
                await OTP.destroy({ where: { user_email: email } }, { transaction }); // Pass transaction to the destroy method

                // Clear temp data from session after successful signup
                delete req.session.tempUserData;

                await transaction.commit(); // Commit the transaction

                req.flash('success_msg', 'Your account has been verified successfully! Please login.');
                return res.redirect('/auth/login');
            } else {
                req.flash('error_msg', 'Invalid OTP!');
                return res.redirect('/auth/verify');
            }
        } catch (error) {
            await transaction.rollback(); // Rollback the transaction on error
            console.error("Error during OTP verification:", error);
            req.flash('error_msg', 'Something went wrong. Please try again!');
            return res.redirect('/auth/verify');
        }
    }



    //     static async showSmsVerifyPage(req, res) {
    //         return res.render('auth_User/verifySms');
    //     }
    //     static async verifySms(req, res) {
    //         try {
    //             const email = req.session.email;
    //             const user = await User.findOne({ where: { email: email } });

    //             if (user) {
    //                 // Find the OTP associated with the user's email
    //                 const otpRecord = await OTP.findOne({ where: { user_email: email } });

    //                 if (otpRecord && otpRecord.otp === req.body.otp) {
    //                     // Mark the user as verified or proceed with login
    //                     user.status = true; // Assuming 'status' indicates a  user use the website
    //                     await user.save();

    //                     // Delete the OTP after successful verification
    //                     await OTP.destroy({ where: { user_email: email } });

    //                     req.flash('success_msg', 'OTP verified successfully!');
    //                     return res.redirect('/');
    //                 } else {
    //                     req.flash('error_msg', 'Invalid OTP!');
    //                     return res.redirect('/auth/verifySms');
    //                 }
    //             } else {
    //                 req.flash('error_msg', 'User not found!');
    //                 return res.redirect('/auth/verifySms');
    //             }
    //         } catch (error) {
    //             console.error("Error during SMS verification:", error);
    //             req.flash('error_msg', 'An error occurred. Please try again.');
    //             return res.redirect('/auth/verifySms');
    //         }
    //     }


    // Render the form where the user submits their email to request password reset
    static async showForgotPasswordForm(req, res) {
        return res.render('auth_User/forgotPassword');
    }

    // Handle the submission of the forgot password form
    static async requestPasswordReset(req, res) {
        try {
            const { email } = req.body;
            const user = await User.findOne({ where: { email } });

            if (!user) {
                req.flash('error_msg', 'No user found with that email address.');
                return res.redirect('/auth/forgotPassword');
            }

            // Generate a secure reset token
            const token = crypto.randomBytes(20).toString('hex');

            // Save token in the database with an expiration time (1 hour)
            await PasswordReset.create({
                user_id: user.id,
                token,
                expires_at: Date.now() + 3600000 // 1 hour from now
            });

            // Send password reset link via email
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                }
            });

            const resetUrl = `${req.protocol}://${req.get('host')}/auth/resetPassword/${token}`;

            await transporter.sendMail({
                from: `"StudyBuddy" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: "StudyBuddy Password Reset",
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #007bff; text-align: center;">Password Reset Request</h2>
                    <p>Dear User,</p>
                    <p>It seems like you requested to reset your password. You can reset it by clicking the link below:</p>
                    <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                    <p>If you did not request this, please ignore this email.</p>
                    <br>
                    <p>Best Regards,</p>
                    <p>The StudyBuddy Team</p>
                </div>
            `,
            });

            req.flash('success_msg', 'Password reset link sent to your email.');
            return res.redirect('/auth/forgotPassword');
        } catch (error) {
            console.error("Error during password reset request:", error);
            req.flash('error_msg', 'Something went wrong. Please try again later.');
            return res.redirect('/auth/forgotPassword');
        }
    }

    // Render the reset password form where the user submits their new password
    static async showResetPasswordForm(req, res) {
        const { token } = req.params;
        const passwordReset = await PasswordReset.findOne({ where: { token } });

        if (!passwordReset || passwordReset.expires_at < Date.now()) {
            req.flash('error_msg', 'Password reset token is invalid or has expired.');
            return res.redirect('/auth/forgotPassword');
        }

        return res.render('auth_User/resetPassword', { token });
    }

    // Handle the submission of the new password
    static async resetPassword(req, res) {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        try {
            // Check if token is valid
            const passwordReset = await PasswordReset.findOne({ where: { token } });

            if (!passwordReset || passwordReset.expires_at < Date.now()) {
                req.flash('error_msg', 'Password reset token is invalid or has expired.');
                return res.redirect('/auth/forgotPassword');
            }

            if (password !== confirmPassword) {
                req.flash('error_msg', 'Passwords do not match.');
                return res.redirect(`/auth/resetPassword/${token}`);
            }

            // Hash the new password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Update user's password
            await User.update(
                { password: hashedPassword },
                { where: { id: passwordReset.user_id } }
            );

            // Delete the password reset token after use
            await PasswordReset.destroy({ where: { token } });

            req.flash('success_msg', 'Your password has been successfully reset.');
            return res.redirect('/auth/login');
        } catch (error) {
            console.error("Error during password reset:", error);
            req.flash('error_msg', 'Something went wrong. Please try again.');
            return res.redirect(`/auth/resetPassword/${token}`);
        }
    }

}



class AuthAdmin {

    // Render Login Page
    static async renderLoginPage(req, res) {
        res.render('auth_Admin/login');
    }

    //check Login Credentials
    static async loginAdmin(req, res) {
        const { email, password, 'g-recaptcha-response': recaptchaResponse } = req.body;

        // Check if reCAPTCHA is completed
        if (!recaptchaResponse) {
            req.flash('error_msg', 'Please complete the reCAPTCHA');
            return res.redirect('/admin/login');
        }

        try {
            // Verify reCAPTCHA
            const secretKey = process.env.RECAPTCHA_SECRET_KEY;
            const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaResponse}`;
            const response = await axios.post(verifyUrl);

            if (!response.data.success) {
                req.flash('error_msg', 'Failed reCAPTCHA verification. Please try again.');
                return res.redirect('/admin/login');
            }

            // Check admin credentials
            const admin = await Admin.findOne({ where: { email } });
            if (!admin || !(await bcrypt.compare(password, admin.password))) {
                req.flash('error_msg', 'Invalid email or password');
                return res.redirect('/admin/login');
            }

            // Store admin session and redirect to dashboard
            req.session.admin = admin;
            req.flash('success_msg', 'Login successful!');
            return res.redirect('/admin/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            req.flash('error_msg', 'Error logging in. Please try again later.');
            return res.redirect('/admin/login');
        }
    }

    //Render Registration Page
    static async renderRegisterPage(req, res) {
        res.render('auth_Admin/signup');
    }


    // Register Admin
    static async registerAdmin(req, res) {
        const { name, email, password } = req.body;

        try {
            // Check if an admin with the provided email already exists
            const existingAdmin = await Admin.findOne({ where: { email } });
            if (existingAdmin) {
                req.flash('error_msg', 'Email is already registered.');
                return res.status(400).redirect('/admin/signup');
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create the new admin
            const newAdmin = await Admin.create({ name, email, password: hashedPassword });

            // Redirect to the login page with a success message
            req.flash('success_msg', 'Registration successful! You can now log in.');
            res.redirect('/admin/login');
        } catch (error) {
            console.error('Error registering admin:', error);
            req.flash('error_msg', 'Error registering admin. Please try again later.');
            res.status(500).redirect('/admin/signup');
        }
    }




    // Render Dashboard Page
    static async dashboard(req, res) {
        res.render('auth_Admin/dashboard', { admin: req.session.admin });
    }

    // Logout Admin
    static async logoutAdmin(req, res) {
        req.session.destroy();
        res.redirect('/admin/login');
    }

}
module.exports = {
    AuthUser,
    AuthAdmin
};