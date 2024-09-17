function isAuthenticated(req, res, next) {
    // if user is authenticated, pass the request otherwise
    // redirect the user to login page
    if (req.isAuthenticated()) {
        return next();
    }

    return res.redirect('/auth/login');
}

module.exports = isAuthenticated;