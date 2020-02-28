var express = require('express');
var router = express.Router();
let models = require('../models');
let moment = require('moment');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const sequelize = require('sequelize');
const Op = sequelize.Op;
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

/* GET home page. */
router.get('/', function (req, res, next) {
  let session = req.session.uid;
  res.render('index', {
    session: session
  });
});

//게시글 페이지
// router.get('/post/:page', function(req, res, next) {
//   let session = req.session.uid;
//   let page_num = req.params.page;
//   console.log(page_num);
//   let offset = 0;
//   if(page_num > 1){
//     offset =5 * (page_num -1);
//   }
//   console.log(offset);
//   models.post.findAll({
//     offset:offset,
//     limit:6
//   }).then(result=>{
//     let post = function(){
//       let posts=[];
//       for(let i =0; i<result.length; i++){
//         let date=moment(result[i].createdAt).format("YYYY-MM-DD HH:mm:ss")
//         posts.push({
//           data:result[i],
//           date:date
//         });
//       }
//       return posts;
//     }
//     res.render("post",{
//       post:post().reverse(),
//       session:session
//     });
//   })
// });

router.get('/post/:page', function (req, res, next) {
  let session = req.session.uid;
  let page_num = req.params.page;
  // console.log(page_num);
  let offset = 0;
  if (page_num > 1) {
    offset = 5 * (page_num - 1);
  }
  models.post.count().then(count => {
    // console.log(offset);
    models.post.findAll({
      offset: offset,
      limit: 6
    }).then(result => {
      let post = function () {
        let posts = [];
        result.reverse();
        for (let i = 0; i < result.length; i++) {
          let date = moment(result[i].createdAt).format("YYYY-MM-DD HH:mm:ss")
          posts.push({
            data: result[i],
            date: date
          });
        }
        return posts;
      }
      let count_out = Math.ceil(count / 6) + 1;
      console.log(count_out + 1);
      res.render("post", {
        post: post(),
        session: session,
        count: count_out
      });
    })
  })
});



//글 생성 페이지 이동 
router.get('/post_make', function (req, res, next) {
  let session = req.session.uid;
  console.log(session);
  if (session) {
    res.render('post_make', {
      session: session
    });
  } else {
    req.flash('login_check', '로그인을 해주세요')
    res.redirect('/users/login_check');
  }
});

// 글 상세 페이지 이동
router.get('/post/page/:id', function (req, res, next) {
  let session = req.session.uid;
  let id = req.params.id;
  let login_user = req.session.uid;
  models.post.findAll({
    where: { id: id }
  })
    .then(result => {
      models.reply.findAll({
        where: { postId: id }
      })
        .then(result2 => {
          let post2 = function () {
            let posts = [];
            for (let j = 0; j < result2.length; j++) {
              let date2 = moment(result2[j].createdAt).format("YYYY-MM-DD HH:mm:ss")
              posts.push({
                data: result2[j],
                date: date2
                //로그인한 session아이디가 들어가야 함
              });
            }
            return posts;
          }
          let post = function () {
            let posts = [];
            for (let i = 0; i < result.length; i++) {
              let date = moment(result[i].createdAt).format("YYYY-MM-DD HH:mm:ss")
              posts.push({
                data: result[i],
                date: date,
                login_user: login_user
              });
            }
            return posts;
          }
          res.render("post_board", {
            post: post(),
            reply: post2(),
            session: session
          })
        })
      models.post.increment({ view: 1 }, { where: { id: id } })
    })
    .catch(err => {
      console.log(err);
    })
});

//글 수정 페이지 이동
router.get('/post_update/:id', function (req, res, next) {
  let session = req.session.uid;
  let id = req.params.id;
  models.post.findOne({
    where: {
      id: id,
    }
  })
    .then(result => {
      if (session === result.user) {
        res.render("post_update", {
          post: result,
          session: session
        });
      } else if (!session) {
        console.log("비로그인");
        req.flash('login_check', '로그인을 해주세요.')
        res.redirect('/users/login_check');
      } else {
        console.log("다른 로그인");
        req.flash('login_different', '작성자만 수정 및 삭제가 가능합니다.')
        res.redirect('/users/login_different');
      }
    })
    .catch(err => {
      console.log("수정 데이터 조회 실패");
    })
});

//글 수정
router.put('/post_update/:id', function (req, res, next) {
  let id = req.params.id;
  let body = req.body;
  models.post.findOne({
    where: { id: id }
  })
    .then(result => {
      models.post.update({
        title: body.title,
        description: body.description
      }, {
        where: { id: id }
      })
        .then(result2 => {
          console.log("수정완료");
          res.redirect('/post/page/' + id);
        })
    })
    .catch(err => {
      console.log(err, "수정 실패");
    })
});

//글 삭제
router.delete('/post_delete/:id', function (req, res, next) {
  let id = req.params.id;
  let session = req.session.uid;
  models.post.findOne({
    where: { id: id }
  })
    .then(result1 => {
      if (session === result1.user) {
        models.post.destroy({
          where: { id: id }
        })
          .then(result2 => {
            models.reply.destroy({
              where: {
                postId: id
              }
            })
              .then(result3 => {
                console.log("글 댓글 삭제");
              })
            console.log("글 삭제");
            res.redirect('/post/1');
          })
      } else if (!session) {
        console.log("비로그인");
        req.flash('login_check', '로그인을 해주세요.')
        res.redirect('/users/login_check');
      } else {
        console.log("다른 로그인");
        req.flash('login_different', '작성자만 수정 및 삭제가 가능합니다.')
        res.redirect('/users/login_different');
      }
    })
    .catch(err => {
      console.log("글 삭제 실패");
    });
});


//댓글 삭제
router.delete('/reply_delete/:id', function (req, res, next) {
  let id = req.params.id;
  let session = req.session.uid;
  models.reply.findOne({
    where: { id: id }
  })
    .then(result => {
      if (session === result.user) {
        models.reply.destroy({
          where: { id: id }
        })
          .then(result => {
            console.log("글 삭제");
            res.redirect('back');
          })
          .catch(err => {
            console.log("글 삭제 실패");
          });
      } else if (session !== result.user) {
        console.log("다른 로그인");
        req.flash('login_different', '작성자만 수정 및 삭제가 가능합니다.')
        res.redirect('/users/login_different');
      } else {
        console.log("비로그인");
        req.flash('login_check', '로그인을 해주세요.')
        res.redirect('/users/login_check');
      }
    })
});

//댓글 수정
router.put('/reply_update/:id', function (req, res, next) {
  let id = req.params.id;
  let body = req.body;
  let session = req.session.uid;
  models.reply.findOne({
    where: { id: id }
  })
    .then(result => {
      if (session === result.user) {
        models.reply.update({
          reply: body.reply_up
        }, {
          where: { id: id }
        })
          .then(result2 => {
            console.log("수정완료");
            res.redirect('back');
          })
          .catch(err => {
            console.log(err, "수정 실패");
          })
      } else if (session !== result.user) {
        console.log("다른 로그인");
        req.flash('login_different', '작성자만 수정 및 삭제가 가능합니다.')
        res.redirect('/users/login_different');
      }
    })
});

//검색기능
router.get("/search", function (req, res, next) {
  console.log(req.query.search);
  let session = req.session.uid;
  let search = req.query.search;
  models.post.findAll({
    where: {
      [Op.or]: [
        {
          title: {
            [Op.like]: "%" + search + "%"
          }
        },
        {
          user: {
            [Op.like]: "%" + search + "%"
          }
        },
        {
          description: {
            [Op.like]: "%" + search + "%"
          }
        }
      ]
    }
  })
    .then(result => {
      let post = function () {
        let posts = [];
        for (let i = 0; i < result.length; i++) {
          let date = moment(result[i].createdAt).format("YYYY-MM-DD HH:mm:ss")
          posts.push({
            date: date
          });
        }
        return posts;
      }
      res.render("search", {
        search: result,
        session: session,
        date: post()
      })
    })
});

//댓글 생성
router.post("/reply/:id", function (req, res, next) {
  let body = req.body;
  let id = req.params.id;
  let login_user = req.session.uid;
  console.log(id);
  if (login_user) {
    models.reply.create({
      postId: id,
      user: login_user,
      reply: body.reply
    })
      .then(result => {
        console.log("댓글 작성 완료");
        res.redirect('/post/page/' + id);
      })
      .catch(err => {
        console.log(err + "댓글 작성 실패");
      })
  } else {
    req.flash('login_check', '로그인을 해주세요')
    res.redirect('/users/login_check');
  }
});

//글 생성
router.post('/post_make', function (req, res, next) {
  let body = req.body;
  console.log(body);
  let login_user = req.session.uid;
  models.post.create({
    title: body.title,
    description: body.description,
    user: login_user,
    view: 0
  })
    .then(result => {
      console.log("글 추가 완료");
      res.redirect('/post/:1');
    })
    .catch(err => {
      console.log("글 추가 실패" + err);
    })
});
module.exports = router;
