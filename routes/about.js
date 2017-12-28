var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', require('connect-ensure-login').ensureLoggedIn(), function(req, res, next) {	
  res.render('about', { title: '关于' });
});

module.exports = router;
