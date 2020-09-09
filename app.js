require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');

//Creating an express app
const app = express();

//set view engine
app.set('view engine', 'ejs');

//static file middleware
app.use(express.static('public'));

// Body-parser middleware 
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: false })); // to support URL-encoded bodies

//Express Session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//connect-flash middleware
app.use(flash());

//Global Variables
app.use((req, res, next) => {
    res.locals.success_message = req.flash('success_message');
    res.locals.failure_message = req.flash('failure_message');
    res.locals.error = req.flash('error');
    next();
});


//Connecting to database
mongoose.connect(process.env.DB_HOST, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (!err) {
        console.log('Connected to database');
    }
});

//Model
const User = require('./models/user');

//Passport config local strategise
require('./config/passport');

//Authentication
const auth = require('./config/authentication');


//Routings
app.get('/home', auth.isLogout, (req, res) => {
    res.render('home');
});

app.get('/register', auth.isLogout, (req, res) => {
    res.render('register');
});

app.get('/login', auth.isLogout, (req, res) => {
    const message=req.flash('error');
    res.render('login',{message:message});
});

app.get('/notes', auth.isLogin, (req, res) => {
    res.render('notes', { user: req.user });
});


app.post('/register', (req, res) => {
    // console.log(req.body);

    User.findOne({ email: req.body.email }, (err, foundUser) => {
        if (err) throw err;
        if (foundUser) {
            req.flash('failure_message', 'User already Registered!');
            // console.log('User already Registered!');
            res.redirect('/register');
        }
        else {
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(req.body.password, salt, function (err, hashPassword) {
                    const user = new User({
                        name: req.body.name,
                        email: req.body.email,
                        password: hashPassword
                    });
                    user.save((err) => {
                        if (err) throw err;
                        // console.log('User is registered..');
                        req.flash('success_message', 'You are Successfully Registered.. Please Login To Continue.');
                        res.redirect('/login');
                    });
                });
            });
        }
    });
});

app.post('/login', passport.authenticate('local', {

    successRedirect: '/notes',
    failureRedirect: '/login',
    failureFlash: true
})
);

app.post('/insert', (req, res) => {
    // console.log(req.body);
    // console.log(req.user._id);
    User.findById(req.user._id, (err, foundUser) => {
        if (err) throw err;
        if (foundUser) {
            foundUser.notes.push({
                title: req.body.title,
                note: req.body.note
            });
            foundUser.save((err) => {
                if (err) throw err;
                res.redirect('/notes');
            });
        }
    });
});

app.post('/update', (req, res) => {
    // console.log(req.body);
    User.findById(req.user._id, (err, foundUser) => {
        if (err) throw err;
        if (foundUser) {
            let length = foundUser.notes.length;
            let i = 0;
            while (i < length) {
                if (foundUser.notes[i]._id == req.body.id) {
                    foundUser.notes[i].title = req.body.title;
                    foundUser.notes[i].note = req.body.note;
                    break;
                }
                i++;
            }
            foundUser.save(err => {
                if (err) throw err;
                else {
                    res.redirect('/notes');
                }
            });
        }
    });
});

app.post('/delete', (req, res) => {
    console.log('delete');
    User.findById(req.user._id, (err, foundUser) => {
        if (err) throw err;
        if (foundUser) {
            let length = foundUser.notes.length;
            let i = 0;
            while (i < length) {
                if (foundUser.notes[i]._id == req.body.id) {
                    index = i;
                    break;
                }
                i++;
            }
            foundUser.notes.splice(index, 1);
            foundUser.save(err => {
                if (err) throw err;
                else {
                    res.redirect('notes');
                }
            });
        }
    });
});

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/home');
});

//Listen to port
app.listen(3000, (err) => {
    if (!err) {
        console.log('Server started on port 3000');
    }
});