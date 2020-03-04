var express = require('express');
var router = express.Router();
var secret = require('../db/secret');
var request = require('request');

router.get('/', function (req, res, next) {
  let session = req.session.passport;
  console.log(req.query.translator);
  let result = req.query.translator;
  res.render('translator', {
    session: session,
    result: result
  });
});

router.get('/result', function (req, res) {
  let session = req.session.passport;
  var query = req.query;
  console.log(query);
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
      res.render('translator', {
        session: session,
        result: result,
        query: query
      });
    } else {
      res.status(response.statusCode).end();
      console.log('error = ' + response.statusCode + error);
    }
  });
});

module.exports = router;