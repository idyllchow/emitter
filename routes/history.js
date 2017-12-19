var express = require('express');
var router = express.Router();

// 历史版本
// router.get('/history', function(req, res){
//     res.sendFile(path.join(__dirname, '..', '/views/history.html'));
// });
router.get('/', function(req, res, next) {
    console.log(req.query.id)
    res.render('history', {title:'历史版本'});
});

module.exports = router;
