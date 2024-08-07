var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET about me page */
router.get('/me', function (req, res, next) {
  res.render('me')
})

module.exports = router;
