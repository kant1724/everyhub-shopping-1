let express = require('express');
let router = express.Router();
let MobileDetect = require('mobile-detect');
let auth = require('../common/auth');

router.get('/', function(req, res, next) {
    let md = new MobileDetect(req.headers['user-agent']);
    if (md.mobile()) {
        res.render('templates/mypage/mypage-mobile', {});
    } else {
        res.render('templates/mypage/mypage', {});
    }
});

router.get('/search_result', function(req, res, next) {
    let query = req.query.query;
    res.render('templates/main/search_result', {query: query});
});

module.exports = router;
