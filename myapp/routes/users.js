var express = require('express');
var router = express.Router();
const models = require("../models");
const crypto =require('crypto');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

var options = {
  host     : 'localhost',
  user     : 'root',
  password : 'abcd1',
  database : 'board',
  clearExpired: true,
  checkExpirationInterval: 900000,
  expiration: 24000 * 60 * 60,
};

router.use(session({
  key: 'sid',
  secret: 'asdasdzxc',
  resave: false,
  saveUninitialized: true,
  store:new MySQLStore(options)
}));

//회원가입 페이지 이동
router.get('/join', function(req, res, next) {
  let session =req.session;
  res.render("join",{
    session:session
  });
});

//회원가입
router.post('/join', function(req, res, next) {
  let body = req.body;
  let pwd = crypto.createHash("sha512").update(body.password).digest("hex");
  models.user.create({
    idUser:body.id,
    password:pwd,
    name:body.username
  })
  .then(result=>{
    console.log("회원가입 성공");
    res.redirect("/users/join");
  })
  .catch(err=>{
    console.log("회원가입 실패"+err);
  })
});

//로그인 페이지 이동
router.get('/login', function(req, res, next) {
  // console.log(req.cookies);
  let session =req.session;
  console.log(session.uid);
  res.render("login", {
    session:session
  });
});

//로그인 
router.post('/login', async function(req, res, next) {
  let body =req.body;  
  let result = await models.user.findOne({
    where:{
      idUser:body.id
    }
  });
  let db_pwd = result.password;
  let input_pwd = body.password;
  let pwd = crypto.createHash("sha512").update(input_pwd).digest("hex");
  
  if(db_pwd === pwd){
    console.log("로그인 비밀번호 일치");
    // console.log(body);
    // console.log(body.id);
    req.session.uid= body.id;
    console.log(req.session);
    req.session.save(function(){
      return res.redirect('/users/login');
    });
  }
  else{
    console.log("로그인 비밀번호 불일치");
    res.redirect("/users/login");
  }
//로그아웃
router.delete("/logout", function(req,res,next){
  console.log(req.session);
  req.session.destroy();
  res.clearCookie('sid');
  return res.redirect('/');
})

});
module.exports = router;
