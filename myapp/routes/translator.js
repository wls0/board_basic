var express = require('express');
var router = express.Router();
var client_id = 'null';
var client_secret = 'null';
var request = require('request');

router.get('/', function(req, res, next) {
  let session =req.session.uid;
  res.render('translator',{
    session:session
  });
});

router.get('/result', function (req, res) {
  let session =req.session.uid;
  var query = req.query.translator;
  var api_url = 'https://openapi.naver.com/v1/papago/n2mt';
  var options = {
      url: api_url,
      form: {'source':'ko', 'target':'en', 'text':query},
      headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
    };
  request.post(options, function (error, response, body) {
    if(!error && response.statusCode === 200){
      // res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
      let json = JSON.parse(body);
      let result= json.message.result.translatedText;
      console.log(typeof(result));
      // res.end(result);
      // res.redirect('/translator');
      res.render('translator_result',{
        session:session,
        result:result,
        query:query
      });
    }else{
      res.status(response.statusCode).end();
      console.log('error = ' + response.statusCode + error);
    }
  });
});

module.exports = router;