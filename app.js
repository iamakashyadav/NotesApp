const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const passport = require('passport');
const session = require('express-session');

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
    resave: false,
    saveUninitialized: false
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Connecting to database
mongoose.connect('mongodb://localhost:27017/Notes', { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
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
    res.render('login');
});

app.get('/notes', auth.isLogin, (req, res) => {
    res.render('notes', { user: req.user });
});


app.post('/register', (req, res) => {
    // console.log(req.body);

    User.findOne({ email: req.body.email }, (err, foundUser) => {
        if (err) throw err;
        if (foundUser) {
            console.log('User is already exist');
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
                        console.log('User is registered..');
                        res.redirect('/login');
                    });
                });
            });
        }
    });
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/notes',
    failureRedirect: '/login'
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
        console.log('Port 3000');
    }
});