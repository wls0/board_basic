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
  console.log('serializeUser', user)
  done(null, user.idUser);
});

passport.deserializeUser(function (user, done) {
  console.log('deserializeUser', user);
  // models.user.findAll(id, function (err, user) {
  done(null, user);
  // });
});

//네이버 
passport.use(new NaverStrategy({
  clientID: 'hlOJ1di6yot7rckQmOj8',
  clientSecret: 'hQGUWpA3Fg',
  callbackURL: '/auth/naver/callback'
},
  function (accessToken, refreshToken, profile, done) {
    var _profile = profile._json;

    loginByThirdparty({
      'auth_type': 'naver',
      'auth_name': _profile.nickname,
      'auth_email': _profile.email
    }, done);
  }
));

function loginByThirdparty(info, done) {
  console.log('process: ' + info.auth_type);
  console.log('process:' + info.auth_name);
  models.user.findOne({
    where: { idUser: info.auth_email }
  })
    .then(result => {
      // console.log(result);
      if (result) {
        done(null, result);
      } else if (!result) {
        models.user.create({
          idUser: info.auth_email,
          name: info.auth_name
        })
          .then(result2 => {
            done(null, result2);
          })
      }
      // if (result.idUser === []) {
      //   models.user.create({
      //     idUser: info.auth_email,
      //     name: info.auth_name
      //   })
      //     .then(result2 => {
      //       done(null, result2);
      //     })
      // } else {
      //   console.log('old user ' + info.auth_name);
      //   console.log(info);
      //   done(null, info)
      // }
    })
}

//네이버 로그인
router.get('/naver',
  passport.authenticate('naver')
);

router.get('/naver/callback',
  passport.authenticate('naver', {
    successRedirect: '/',
    failureRedirect: '/login'
  })
);

router.get("/logout", function (req, res, next) {
  console.log(req.session);
  req.logout();
  req.session.destroy();
  return res.redirect('/');
});

module.exports = router;