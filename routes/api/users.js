var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var User = mongoose.model('User');
var auth = require('../auth');

router.post('/users', function(req, res, next) {
    var user = new User();

    user.username = req.body.user.username;
    user.email = req.body.user.email;

    user.setPassword(req.body.user.password);

    // Save User information
    user.save().then(function() {
        return res.json({user: user.toAuthJSON()});

    }).catch(next);
});

router.post('/users/login', function(req, res, next) {
    // 1. Check if email is entered
    if (!req.body.user.email) {
        return res.status(422).json({errors: {email: "cannot be blank!"}});
    }

    // 2. Check if password is entered
    if (!req.body.user.password) {
        return res.status(422).json({errors: {password: "can't be blank!"}});

    }

    // 3. Now that we know both pieces of information is properly entered, check to see if it works
    passport.authenticate('local', {session: false}, function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (user) {
            user.token = user.generateJWT();
            return res.json({user: user.toAuthJSON()});
        } else {
            return res.status(422).json(info);
        }
    })(req, res, next);
});

router.get('/user', auth.required, function(req, res, next) {
    User.findById(req.payload.id).then(function(user) {
        if (!user) {
            return res.sendStatus(401);
        }

        return res.json({user: user.toAuthJSON()});
    }).catch(next);
});

router.put('/user', auth.required, function(req, res, next) {
    User.findById(req.payload,id).then(function(user){
        // 1. Check if User returned is valid
        if (!user) {
            return res.sendStatus(401);
        }

        // 2. Update a field of the User iff a value is passed
        if (typeof req.body.user.username !== 'undefined') {
            user.username = req.body.user.username;
        }
        if (typeof req.body.user.email !== 'undefined') {
            user.email = req.body.user.email;
        }
        if (typeof req.body.user.bio !== 'undefined') {
            user.bio = req.body.user.bio;
        }
        if (typeof req.body.user.image !== 'undefined') {
            user.image = req.body.user.image;
        }
        if (typeof req.body.user.password !== 'undefined') {
            user.setPassword(req.body.user.password);
        }

        // 3. Save this information
        return user.save().then(function() {
            return res.json({user: user.toAuthJSON()});
        });
    }).catch(next);
});

module.exports = router;