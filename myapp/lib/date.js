var express = require('express');
var router = express.Router();
let models =require('../models');
let moment = require('moment');

module.exports = {
  date:function(result){
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
    return post;
  }
};