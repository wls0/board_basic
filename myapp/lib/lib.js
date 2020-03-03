var express = require('express');
var router = express.Router();
let models = require('../models');
let moment = require('moment');

module.exports = {
  date: function (result) {
    let posts = [];
    for (let i = 0; i < result.length; i++) {
      let date = moment(result[i].createdAt).format("YYYY-MM-DD HH:mm:ss")
      posts.push({
        data: result[i],
        date: date
      });
    }
    return posts;
  },
  reply_date: function (result) {
    let posts = [];
    for (let j = 0; j < result.length; j++) {
      let date = moment(result[j].createdAt).format("YYYY-MM-DD HH:mm:ss")
      posts.push({
        data: result[j],
        date: date
      });
    }
    return posts;
  },
  loginByThirdparty: function (info, done) {
    models.user.findOne({
      where: { idUser: info.auth_email }
    })
      .then(result => {
        // console.log(result);
        if (result) {
          return done(null, result);
        } else if (!result) {
          models.user.create({
            idUser: info.auth_email,
            name: info.auth_name
          })
            .then(result2 => {
              return done(null, result2);
            })
        }
      })
  }
}