var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('ios', { title: 'iOS历史版本' });
});

module.exports = router;
