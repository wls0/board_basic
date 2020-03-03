var express = require('express');
var router = express.Router();
const models = require("../models");
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const NaverStrategy = require('passport-naver').Strategy;
let auth = require('../lib/lib');


//네이버 로그인 처음
router.get('/naver',
  passport.authenticate('naver')
);

router.get('/naver/callback',
  passport.authenticate('naver', {
    successRedirect: '/',
    failureRedirect: '/login'
  })
);
//구글 로그인 처음
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/login'
  })
);

//네이버 로그인 
passport.use(new NaverStrategy({
  clientID: 'hlOJ1di6yot7rckQmOj8',
  clientSecret: 'hQGUWpA3Fg',
  callbackURL: '/auth/naver/callback',
  authType: 'reauthenticate'
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

//구글 로그인
passport.use(new GoogleStrategy({
  clientID: '307228444318-rs02007fjb9toj95f0403r72bfudliu1.apps.googleusercontent.com',
  clientSecret: 'caBMxvyziNL9Kka0M774vL4F',
  callbackURL: '/auth/google/callback',
  authType: 'reauthenticate'
},
  function (accessToken, refreshToken, profile, done) {
    var _profile = profile._json;
    console.log(_profile);
    loginByThirdparty({
      'auth_type': 'google',
      'auth_name': _profile.given_name,
      'auth_email': _profile.email
    }, done);
  }
));
//회원가입, 로그인
function loginByThirdparty(info, done) {
  console.log('process: ' + info.auth_type);
  console.log('process:' + info.auth_name);
  let loginByThirdparty = auth.loginByThirdparty(info, done)
  return loginByThirdparty
}

router.get("/logout", function (req, res, next) {
  console.log(req.session);
  req.logout();
  req.session.destroy();
  return res.redirect('/login');
});

module.exports = router;