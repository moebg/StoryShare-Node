var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var secret = require('../config').secret;

// 2. Create the UserSchema => Our User Object Constructor
var UserSchema = new mongoose.Schema({
    username: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/^[a-zA-Z0-9]+$/, 'is invalid'], index: true},
    email: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
    bio: String,
    image: String,
    hash: String,
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article'}],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    salt: String 
}, {timestamps: true});

UserSchema.plugin(uniqueValidator, {message: 'is already taken. '});

// Stores user's password as a hash
UserSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

// When user logs in, the method will verify if proper password is entered
UserSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
};

// Genrates a JWT for our User
UserSchema.methods.generateJWT = function() {
    var today = new Date();
    var exp = new Date(today);

    return jwt.sign({
        id: this._id,
        username: this.username,
        exp: parseInt(exp.getTime() / 1000),
    }, secret);
};

// Method for User's JSON for authentication with JWT()
UserSchema.methods.toAuthJSON = function() {
    return {
        username: this.username,
        email: this.email,
        token: this.generateJWT(),
        bio: this.bio,
        image: this.image
    };
};

//
// Getter Method for User's JSON
//
UserSchema.methods.toProfileJSONFor = function(user) {
    return {
        username: this.username,
        bio: this.bio,
        image: this.image || 'https://static.productionready.io/images/smiley-cyrus.jpg',
        following: user ? user.isFollowing(this._id) : false
    };
};

//
// Methods to modify Favorite State Variables
//
UserSchema.methods.favorite = function(id) {
    if (this.favorites.indexOf(id) === -1) {
        this.favorites.push(id);
    }

    return this.save();
};
UserSchema.methods.unfavorite = function(id) {
    this.favorites.remove(id);
    return this.save();
}
UserSchema.methods.isFavorite = function(id) {
    return this.favorites.some(function(favoriteId) {
        return favoriteId.toString === id.toString();
    });
};

//
// Add following relationships
//
UserSchema.methods.follow = function(id) {
    if (this.following.indexOf(id) === -1) {
        // It's not in there, so follow!
        this.following.push(id);
    }

    return this.save();
};
UserSchema.methods.unfollow = function(id) {
    // Removes the user id from User's array of users it's following
    this.following.remove(id);
    return this.save();
};

UserSchema.methods.isFollowing = function(id) {
    return this.following.some(function(userId) {
        return userId.toString === id.toString();
    });
};


// Register user model
mongoose.model('User', UserSchema);


