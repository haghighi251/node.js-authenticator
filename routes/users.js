// Modules
var express = require('express');
var escapeHtml = require('escape-html');

var router = express.Router();

// This route will be executed after calling the user route.
router.get('/', function(req, res) {
    // If we had a user session, We must redirect to the home route.
    if (req.session.user == "undefined" || req.session.user === null) {
        res.redirect('/');
    } else {
        res.render('profile', {title: 'Profile', user: escapeHtml(req.session.user)});
    }
});

module.exports = router;
