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

router.get('/modify', function(req, res, next) {
    let md = new MobileDetect(req.headers['user-agent']);
    let userNo = auth.getUserNo(req);
    let adminYn = auth.getAdminYn(req);
    let orderNo = req.query.orderNo;
    if (md.mobile()) {
        res.render('templates/mypage/modify-mobile', {userNo: userNo, adminYn: adminYn, orderNo: orderNo});
    } else {
        res.render('templates/mypage/modify', {userNo: userNo, adminYn: adminYn, orderNo: orderNo});
    }
});

module.exports = router;
