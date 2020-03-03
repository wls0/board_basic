var express = require('express');
var router = express.Router();
const models = require("../models");
const crypto = require('crypto');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');

//로그인 페이지 이동
router.get('/', function (req, res, next) {
  // console.log(req.cookies);
  let session = req.session.passport;
  console.log(session);
  // let message = req.flash('login')[0];
  res.render("login", {
    session: session
  });
});

passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'password'
},
  function (username, password, done) {
    models.user.findOne({
      where: { idUser: username }
    })
      .then(result => {
        let pwd = crypto.createHash("sha512").update(password).digest("hex");
        if (result.idUser === username) {
          if (result.password === pwd) {
            console.log('성공');
            return done(null, result);
          } else {
            console.log('password');
            return done(null, false, { message: 'Incorrect password.' });
          }
        } else {
          console.log('id', result.idUser);
          return done(null, false, { message: 'Incorrect username.' });
        }
      })
  }
));

//로그인
router.post('/',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }));

//로그아웃
router.delete("/logout", function (req, res, next) {
  console.log(req.session);
  req.session.destroy();
  res.clearCookie('sid');
  return res.redirect('/');
});

module.exports = router;