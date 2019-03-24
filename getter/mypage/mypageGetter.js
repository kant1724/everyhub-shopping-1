let express = require('express');
let router = express.Router();
let MobileDetect = require('mobile-detect');
let auth = require('../common/auth');

router.get('/', function(req, res, next) {
    let md = new MobileDetect(req.headers['user-agent']);
    let userNo = auth.getUserNo(req);
    let adminYn = auth.getAdminYn(req);
    if (userNo == 0) {
        if (md.mobile()) {
            res.render('templates/user/login-mobile', {userNo: userNo, adminYn: adminYn});
        } else {
            res.render('templates/user/login', {userNo: userNo, adminYn: adminYn});
        }
    } else {
        if (md.mobile()) {
            res.render('templates/mypage/mypage-mobile', {userNo: userNo, adminYn: adminYn});
        } else {
            res.render('templates/mypage/mypage', {userNo: userNo, adminYn: adminYn});
        }
    }
});

router.get('/search_result', function(req, res, next) {
    let query = req.query.query;
    let userNo = auth.getUserNo(req);
    let adminYn = auth.getAdminYn(req);
    res.render('templates/main/search_result', {query: query, userNo: userNo, adminYn: adminYn});
});

module.exports = router;
