// Modules.
var express = require('express');
const {body, validationResult} = require('express-validator');

// Loading application configuration.
const {db, users} = require('../model.js');

var router = express.Router();

// Showing registration form by GET request.
router.get('/register', function (req, res) {
    // If we had a user session, We must redirect to the home route.
    if (req.session.user) {
        res.redirect('/');
    } else {
        res.render('register', {
            title: 'Register',
            errors: null,
            show_error: "",
            registered_done: ""
        });
    }
});

// This route will be executed after submitting the registration form.
router.post(
        '/register',
//We have to validate datas.
// username must be an email
        body('email').isEmail().withMessage('The email is not correct.'),
        // Checking if the email is repetitive.
        body('email').custom(inserted_email => {
    return users.find({
        email: inserted_email
    }).then(user => {
        if (user.length > 0) {
            return Promise.reject('E-mail already in use.');
        }
    });
}).withMessage('E-mail already in use.'),
        // Full name must be 6 characters.        
        body('full_name').isLength({min: 6}).withMessage('Must be at least 6 chars long.'),
        // UserName must be 6 characters.   
        body('user_name').isLength({min: 3}).withMessage('Must be at least 3 chars long.'),
        // Checking if the UserName is repetitive.          
        body('user_name').custom(inserted_user_name => {
    return users.find({
        user_name: inserted_user_name
    }).then(user => {
        if (user.length > 0) {
            return Promise.reject('Username already in use.');
        }
    });
}).withMessage('Username already in use.'),
        // password must be at least 6 chars long
        body('password').isLength({min: 6}).withMessage('Must be at least 6 chars long.'),
        (req, res) => {
    // If we had errors on the past validation, the errors variable keeps them showing.
    const errors = validationResult(req);
    
    // After adding a new user, This variable will be true and on the view, a Success message will be shown.
    var registered_done = false;
    
    // Each user has a unique_id field that is numeric.
    var unique_id = "";
    
    if (errors.isEmpty()) {
         // Now we can add new user
        // Making random number for user unique_id field.
        var today = new Date();
        var date = today.getFullYear() + (today.getMonth() + 1) + today.getDate();
        var time = today.getHours() + today.getMinutes() + today.getSeconds();
        unique_id = Math.floor(parseInt(date + time) * 10000 * Math.random() * 10000 * Math.random() * 1000);
        
        // Making a new instance of users Schema.
        let data_for_db = new users({
            email: req.body.email,
            user_name: req.body.user_name,
            full_name: req.body.full_name,
            password: req.body.password,
            unique_id: unique_id,
            register_at: new Date(),
            update_at: null,
            role: 2,// Admin could be 1.
            status: 1
        });
        
        // Adding new user to db.
        data_for_db.save();
        registered_done = true;
    }
    res.render('register', {
        title: 'Register',
        errors: errors.array(),
        show_error: errors.array().length ? true : "",
        registered_done: registered_done ? true : "",
        unique_id: unique_id
    });
});

module.exports = router;
