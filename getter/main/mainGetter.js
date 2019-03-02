let express = require('express');
let auth = require('../common/auth').check;
let router = express.Router();
let MobileDetect = require('mobile-detect');

router.get('/', function(req, res, next) {
    let md = new MobileDetect(req.headers['user-agent']);
    if (md.mobile()) {
        res.render('templates/main/main-mobile', {});
    } else {
        res.render('templates/main/main', {});
    }
});

router.get('/search_result', function(req, res, next) {
    let query = req.query.query;
    res.render('templates/main/search_result', {query: query});
});

module.exports = router;
