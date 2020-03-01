var express = require('express');
var router = express.Router();
const models = require("../models");
const crypto = require('crypto');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const NaverStrategy = require('passport-naver').Strategy;
var flash = require('connect-flash');

var options = {
  host: 'localhost',
  user: 'root',
  password: 'abcd1',
  database: 'board',
  clearExpired: true,
  checkExpirationInterval: 900000,
  expiration: 24000 * 60 * 60,
};

router.use(session({
  key: 'sid',
  secret: 'asdasdzxc',
  resave: false,
  saveUninitialized: true,
  store: new MySQLStore(options)
}));

router.use(flash());
router.use(passport.initialize());
router.use(passport.session());

passport.serializeUser(function (user, done) {
  console.log('serializeUser', user.idUser)
  done(null, user.idUser);
});

passport.deserializeUser(function (user, done) {
  console.log('deserializeUser', user);
  // models.user.findAll(id, function (err, user) {
  done(null, user);
  // });
});

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

passport.use(new NaverStrategy({
  clientID: config.naver.clientID,
  clientSecret: config.naver.clientSecret,
  callbackURL: config.naver.callbackURL
},
  function (accessToken, refreshToken, profile, done) {
    User.findOne({
      'naver.id': profile.id
    }, function (err, user) {
      if (!user) {
        user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          username: profile.displayName,
          provider: 'naver',
          naver: profile._json
        });
        user.save(function (err) {
          if (err) console.log(err);
          return done(err, user);
        });
      } else {
        return done(err, user);
      }
    });
  }
));

//네이버 로그인
router.route('/auth/naver')
  .get(passport.authenticate('naver', {
    failureRedirect: '/login'
  }), users.signin);

//로그아웃
router.delete("/logout", function (req, res, next) {
  console.log(req.session);
  req.session.destroy();
  res.clearCookie('sid');
  return res.redirect('/');
});



module.exports = router;