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

router.get('/post_make', function(req, res, next) {
  res.render('post_make');
});

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
