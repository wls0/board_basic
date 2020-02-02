var express = require('express');
var router = express.Router();
let models =require('../models');
let moment = require('moment');



/* GET home page. */
router.get('/', function(req, res, next) {
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
      post:post()
    });
  })
});

//글 생성 페이지 이동 
router.get('/post_make', function(req, res, next) {
  res.render('post_make');
});

//글 상세 페이지 이동
router.get('/post/:id',function(req, res, next) {
  let id = req.params.id;
  models.post.findAll({
    where:{id:id}
  })
  .then(result=>{
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
    res.render("post",{
      post:post()
    })
  })
  .catch(err=>{
    console.log(err);
  })
});

//글 수정 페이지 이동
router.get('/post_update/:id',function(req,res,next) {
  let id = req.params.id;
  models.post.findOne({
    where: {id:id}
  })
  .then(result =>{
    res.render("post_update",{
      post:result
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
      description:body.description
    },{
      where:{id:id}
    })
    .then(result2 =>{
      console.log("수정완료");
      res.redirect('/');
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
    console.log("글 삭제");
    res.redirect('/');
  })
  .catch(err=>{
    console.log("글 삭제 실패");
  });
});

//글 생성
router.post('/post_make', function(req, res, next) {
  let body = req.body;
  models.post.create({
    title:body.title,
    description:body.description,
    user : "user"
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
