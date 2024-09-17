const express = require("express");
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const app = express();
const flash = require('connect-flash');
const myEmitter = require('./eventEmitter');
// Middleware for static files
app.use(express.static('public'));

// Load associations
require('./models/associations');

app.use('/videos', express.static(path.join(__dirname, 'uploads')));

// Routes
const uploadRouter = require('./routes/uploadRoutes');
const authRouter = require('./routes/authUserRoutes');
const removeRouter=require('./routes/removeRoutes');
const adminRouter = require('./routes/authAdminRoutes');

const userRouter = require('./routes/user');
const layoutRouter = require('./routes/layout');
const reviewRouter = require('./routes/reviewRoutes');
const courseRouter = require('./routes/courseRoutes');
const enrollmentsRouter = require('./routes/enrollmentsRoutes');
const addCartRouter = require('./routes/addCartRoutes');
const paymentRouter = require('./routes/paymentRoutes');



// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
// Authentication middleware and strategy
const isAuthenticated = require('./middlewares/is_authenticated');
const localStrategy = require('./middlewares/localStrategy');

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
    secret: 'helpbook',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 60 * 60 * 1000,  // 1 hr in milliseconds (60000ms)
        // maxAge: 30 * 60 * 1000,  // 30 minutes in milliseconds
    },
    rolling: true  // Refresh the session cookie on every request
}));

app.use(flash());
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
  });
app.use('/admin', adminRouter);
app.use('/admin/videos', uploadRouter);
app.use('/admin/remove',removeRouter);
app.use(passport.initialize());
app.use(passport.session());


passport.use(localStrategy);
// Public routes (no authentication required)
app.use('/', layoutRouter);

app.use('/course', courseRouter);
// Private routes (authentication required)
app.use('/auth', authRouter);
app.use(isAuthenticated);  // Apply authentication middleware after public routes

app.use('/course/enrollments', enrollmentsRouter);  // Specific routes for enrollments
app.use('/course/reviews', reviewRouter);  // Specific routes for reviews
app.use('/cart', paymentRouter);
app.use('/course/add-to-cart', addCartRouter);  // Specific routes for enrollment
app.use('/user', userRouter);




// Listen for the 'serverStarted' event
myEmitter.on('serverStarted', () => {
    console.log('Server has started successfully!');
});

// Start server
app.listen(3005, () => {
    myEmitter.emit('serverStarted');
    console.log('Server is running on http://localhost:3005');
});
