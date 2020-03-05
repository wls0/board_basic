var express = require('express');
var router = express.Router();
var secret = require('../db/secret');
var request = require('request');

router.get('/', function (req, res, next) {
  let session = req.session.passport;
  console.log();
  res.render('translator', {
    session: session,
  });
});
// let language = "";
// router.get('/langs', function (req, res) {
//   var api_url = 'https://openapi.naver.com/v1/papago/detectLangs';
//   var query = req.query.translator;
//   var options = {
//     url: api_url,
//     form: { 'query': query },
//     headers: { 'X-Naver-Client-Id': secret.naver.clientID, 'X-Naver-Client-Secret': secret.naver.clientSecret }
//   };
//   request.post(options, function (error, response, body) {
//     if (!error && response.statusCode == 200) {
//       let json = JSON.parse(body);
//       let result = json.langCode;
//       console.log('result' + result)

//     } else {
//       res.status(response.statusCode).end();
//       console.log('error = ' + response.statusCode);
//     }
//   });
// });

router.get('/result', function (req, res) {
  var query = req.query.translator;
  // console.log('lang' + language);
  // console.log(query);
  var api_url = 'https://openapi.naver.com/v1/papago/n2mt';
  var options = {
    url: api_url,
    form: { 'source': 'ko', 'target': 'en', 'text': query },
    headers: { 'X-Naver-Client-Id': secret.naver.clientID, 'X-Naver-Client-Secret': secret.naver.clientSecret }
  };
  request.post(options, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      let json = JSON.parse(body);
      let result = json.message.result.translatedText;
      console.log(result);
      res.json(result);
    } else {
      res.status(response.statusCode).end();
      console.log('error = ' + response.statusCode + error);
    }
  });
});



module.exports = router;