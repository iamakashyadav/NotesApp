const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/user');


passport.use('local', new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, (email, password, done) => {
    User.findOne({ email: email }, (err, foundUser) => {
        if (err) { return done(err); }
        if (!foundUser) { return done(null, false); }
        else {
            bcrypt.compare(password, foundUser.password, function (err, result) {
                if (result == false) {
                    console.log('Enter Correct Input and Password');
                    return done(null, false);
                }
                else {
                    return done(null, foundUser);
                }
            });
        }
    });
}));


passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

