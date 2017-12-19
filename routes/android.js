var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('android', { title: 'Android历史版本' });
});

module.exports = router;
