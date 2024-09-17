const passport = require("passport");
const LocalStrategy = require('passport-local');
const User = require('../models/users');
const bcrypt = require('bcrypt');


const localStrategy = new LocalStrategy({
    usernameField: 'email',
    passReqToCallback: true // Pass `req` to use `req.flash`
}, async (req, email, password, done) => {
    try {
        const user = await User.findOne({
            where: { email: email }
        });

        // If user not found, send a flash message
        if (!user) {
            return done(null, false, req.flash('error_msg', 'User with that email does not exist!'));
        }

        // Compare password with bcrypt
        const isPasswordSame = await bcrypt.compare(password, user.password);
        if (!isPasswordSame) {
            return done(null, false, req.flash('error_msg', 'Incorrect password. Please try again.'));
        }

        console.log("User logged in:", email);
        return done(null, user); // If everything is correct, return the user

    } catch (error) {
        console.error("Error while login:", error);
        return done(error);
    }
});

passport.serializeUser(function(user, done) {
    return done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
    try {
        const user = await User.findByPk(id);
        if (!user) {
            return done(null, false);
        }
        return done(null, user);
    } catch (error) {
        console.error('Error in deserializing user:', error);
        return done(error);
    }
});

module.exports = localStrategy;
