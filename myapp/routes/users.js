var express = require('express');
var router = express.Router();
const models = require("../models");
const crypto = require('crypto');

//회원가입 페이지 이동
router.get('/join', function (req, res, next) {
  let session = req.session.passport;
  res.render("join", {
    session: session
  });
});

//회원가입
router.post('/join', function (req, res, next) {
  let body = req.body;
  let pwd = crypto.createHash("sha512").update(body.password).digest("hex");
  models.user.create({
    idUser: body.id,
    password: pwd,
    name: body.username
  })
    .then(result => {
      console.log("회원가입 성공");
      res.redirect("/login");
    })
    .catch(err => {
      console.log("회원가입 실패" + err);
      req.flash('join_check', '중복되는 아이디가 있습니다.');
      res.redirect('/users/join_check');
    })
});

//회원가입 확인
router.get('/join_check', function (req, res, next) {
  // console.log(req.cookies);
  let session = req.session.passport;
  // console.log(session);
  let message = req.flash('join_check')[0];
  res.render("join_check", {
    session: session,
    message: message
  });
});

//로그인이 안된 세션 접근시
router.get('/login_check', function (req, res, next) {
  // console.log(req.cookies);
  let session = req.session.passport;
  // console.log(session);
  let message = req.flash('login_check')[0];
  res.render("login_check", {
    session: session,
    message: message
  });
});

//게시물유저와 로그인 유저가 다를시
router.get('/login_different', function (req, res, next) {
  let session = req.session.passport;
  let message = req.flash('login_different')[0];
  res.render("contect_error", {
    session: session,
    message: message
  });
});

module.exports = router;
