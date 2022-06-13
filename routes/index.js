// Modules
var express = require('express');
var session = require('express-session');
var escapeHtml = require('escape-html');
const {body, validationResult} = require('express-validator');

//Loading database configurations.
const {db, users} = require('../model.js');

//var router = express.Router();
var app = express();

// Setting session configuration.
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

// middleware to test if authenticated.
function isAuthenticated(req, res, next) {
    if (req.session.user)
        next();
    else
        next('route');
}

/**
 * Home page. If we don't have user session, It will be redirected to login route.
 */
app.get('/', isAuthenticated, function (req, res) {
    res.render('index', {title: 'Home', user: escapeHtml(req.session.user)});
});

// Login route based on GET request.
app.get('/', function (req, res) {
    res.render('login', {
        title: 'Login',
        errors: null,
        show_error: ""
    });
});

// Login route based on POST request. This route will call after submitting the login form.
app.post('/login',
        // We must check email format is correct and password is at least 6 characters.
        body('email').isEmail().withMessage('The email is not correct.'),
        body('password').isLength({min: 6}).withMessage('Must be at least 6 chars long'),
        (req, res) => {
    // If we had errors on the past validation, the errors variable keeps them showing.
    const errors = validationResult(req);
    // error_message is used for database connection errors and wrong login information.
    var error_message = [];
    if (errors.isEmpty()) {
        // Now we can check if user exists.
        return users.findOne(
                {email: req.body.email, password: req.body.password},
                function (err, user_data) {
                    if (err) {
                        // Error in database working.
                        error_message.push({param: 'Database error', msg: "There is a problem in connecting to the database."});
                        console.log(err);
                    } else {
                        if (user_data === null) {
                            // Wrong login datas.
                            error_message.push({param: 'Wrong data', msg: "Email or password in not correct."});
                        } else {
                            //Everything is right and now we can make user session.
                            return req.session.regenerate(function (err) {
                                if (err)
                                    next(err);
                                // Store user information in session.
                                req.session.user = user_data.user_name;

                                // Saving the session before redirecting to home page
                                // Load does not happen before session is saved
                                req.session.save(function (err) {
                                    if (err) {
                                        console.log(err);
                                        return next(err);
                                    } else {
                                        res.redirect('/');
                                    }
                                });
                            });
                        }
                    }
                    // This render will be used if error_message wasn't empty.
                    res.render('login', {
                        title: 'Login',
                        errors: error_message,
                        show_error: error_message.length ? true : ""
                    });
                });
    } else
    {
        // This render will be used if errors wasn't empty.
        res.render('login', {
            title: 'Login',
            errors: errors.array(),
            show_error: errors.array().length ? true : ""
        });
    }
});

// Login route based on GET request. This route will call before submitting the login form.
app.get('/login', function (req, res) {
    if (req.session.user) {
        // If we had a user session, We must redirect to the home route.
        res.redirect('/');
    } else {
        res.render('login', {
            title: 'Login',
            errors: null,
            show_error: ""
        });
    }
});

// Logout route based on GET request. It will be executed after clicking on the logout link.
app.get('/logout', function (req, res, next) {
    // logout logic

    // clear the user from the session object and save.
    // this will ensure that re-using the old session id
    // does not have a logged in user
    req.session.user = null
    req.session.save(function (err) {
        if (err)
            next(err);
        req.session.regenerate(function (err) {
            if (err)
                next(err);
            res.redirect('/');
        });
    });
});

module.exports = app;
