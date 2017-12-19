var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('================start about============');	
  res.render('about', { title: 'About' });
});

module.exports = router;
