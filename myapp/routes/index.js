var express = require('express');
var router = express.Router();
let models =require('../models');
let moment = require('moment');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const sequelize =require('sequelize');
const Op = sequelize.Op;

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


/* GET home page. */
router.get('/', function(req, res, next) {
  let session =req.session.uid;
  models.post.findAll().then(result=>{
    let post = function(){
      let posts=[];
      for(let i =0; i<result.length; i++){
        let date=moment(result[i].createdAt).format("YYYY-MM-DD HH:mm:ss")
        posts.push({
          data:result[i],
          date:date
        });
      }
      return posts;
    }
    res.render("index",{
      post:post(),
      session:session
    });
  })
});

//글 생성 페이지 이동 
router.get('/post_make', function(req, res, next) {
  let session =req.session;
  res.render('post_make',{
    session:session
  });
});

// //글 상세 페이지 이동
router.get('/post/:id',function(req, res, next) {
  let session =req.session.uid;
  let id = req.params.id;
  let login_user = req.session.uid;
  models.post.findAll({
    where:{id:id}
  })
  .then(result=>{
    models.reply.findAll({
      where:{postId:id}
    })
    .then(result2 =>{
      let post2 = function(){
        let posts=[];
        for(let j =0; j<result2.length; j++){
          let date2=moment(result2[j].createdAt).format("YYYY-MM-DD HH:mm:ss")
          posts.push({
            data:result2[j],
            date:date2
            //로그인한 session아이디가 들어가야 함
          });
        }
        return posts;
      }
      let post = function(){
        let posts=[];
        for(let i =0; i<result.length; i++){
          let date=moment(result[i].createdAt).format("YYYY-MM-DD HH:mm:ss")
          posts.push({
            data:result[i],
            date:date,
            login_user:login_user
          });
        }
        return posts;
      }
      res.render("post",{
        post:post(),
        reply:post2(),
        session:session
      })
    })
    models.post.increment({view:1}, {where: {id:id}})
  })
  .catch(err=>{
    console.log(err);
  })
});

//글 수정 페이지 이동
router.get('/post_update/:id',function(req,res,next) {
  let session =req.session.uid;
  let id = req.params.id;
  models.post.findOne({
    where: {id:id}
  })
  .then(result =>{
    res.render("post_update",{
      post:result,
      session:session
    });
  })
  .catch(err=>{
    console.log("수정 데이터 조회 실패");
  })
});

//글 수정
router.put('/post_update/:id', function(req, res, next) {
  let id = req.params.id;
  let body = req.body;
  models.post.findOne({
    where:{id:id}
  })
  .then(result=>{
    models.post.update({
      title:body.title,
      description:body.description
    },{
      where:{id:id}
    })
    .then(result2 =>{
      console.log("수정완료");
      res.redirect('/post/'+id);
    })
  })
  .catch(err=>{
    console.log(err,"수정 실패");
  })
});

//글 삭제
router.delete('/post_delete/:id', function(req, res, next) {
  let id = req.params.id;
  models.post.destroy({
    where:{id:id}
  })
  .then(result=>{
    models.reply.destroy({
      where:{
        postId:id
      }
    })
    .then(result2 =>{
      console.log("글 댓글 삭제");
    })
    console.log("글 삭제");
    res.redirect('/');
  })
  .catch(err=>{
    console.log("글 삭제 실패");
  });
});

//댓글 삭제
router.delete('/reply_delete/:id', function(req, res, next) {
  let id = req.params.id;
  models.reply.destroy({
    where:{id:id}
  })
  .then(result=>{
    console.log("글 삭제");
    res.redirect('back');
  })
  .catch(err=>{
    console.log("글 삭제 실패");
  });
});

//댓글 수정
router.put('/reply_update/:id', function(req, res, next) {
  let id = req.params.id;
  let body = req.body;
  models.reply.findOne({
    where:{id:id}
  })
  .then(result=>{
    models.reply.update({
      reply:body.reply
    },{
      where:{id:id}
    })
    .then(result2 =>{
      console.log("수정완료");
      res.redirect('back');
    })
  })
  .catch(err=>{
    console.log(err,"수정 실패");
  })
});

router.get("/search" , function(req, res, next){
  console.log(req.query.search);
  let session =req.session;
  let search = req.query.search;
  models.post.findAll({
    where:{
      [Op.or]:[
        {
          title:{
            [Op.like]:"%"+search+"%"
          }
        },
        {
          user:{
            [Op.like]:"%"+search+"%"
          }
        },
        {
          description:{
            [Op.like]:"%"+search+"%"
          }
        }
      ]
    }
  })
  .then(result =>{
    console.log(result);
    res.render("search",{
      search:result,
      session:session
    })
  })
});

//댓글 생성
router.post("/reply/:id", function(req, res, next) {
  let body = req.body;
  let id = req.params.id;
  let login_user = req.session.uid;
  console.log(id);
  models.reply.create({
    postId:id,
    user: login_user,
    reply:body.reply
  })
  .then(result =>{
    console.log("댓글 작성 완료");
    res.redirect('/post/'+id);
  })
  .catch(err=>{
    console.log(err+"댓글 작성 실패");
  })
});

//글 생성
router.post('/post_make', function(req, res, next) {
  let body = req.body;
  let login_user = req.session.uid;
  models.post.create({
    title:body.title,
    description:body.description,
    user : login_user
  })
  .then(result=>{
    console.log("글 추가 완료");
    res.redirect("/");
  })
  .catch(err=>{
    console.log("글 추가 실패");
  })
});
module.exports = router;
