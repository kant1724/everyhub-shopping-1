let express = require('express');
let router = express.Router();
let MobileDetect = require('mobile-detect');
let auth = require('../common/auth');

router.get('/', function(req, res, next) {
    let md = new MobileDetect(req.headers['user-agent']);
    let userNo = auth.getUserNo(req);
    let adminYn = auth.getAdminYn(req);
    if (md.mobile()) {
        res.render('templates/user/login-mobile', {userNo: userNo, adminYn: adminYn});
    } else {
        res.render('templates/user/login', {userNo: userNo, adminYn: adminYn});
    }
});

router.get('/sign_up', function(req, res, next) {
    let md = new MobileDetect(req.headers['user-agent']);
    let userNo = auth.getUserNo(req);
    let adminYn = auth.getAdminYn(req);
    if (md.mobile()) {
        res.render('templates/user/sign_up-mobile', {userNo: userNo, adminYn: adminYn});
    } else {
        res.render('templates/user/sign_up', {userNo: userNo, adminYn: adminYn});
    }
});

router.post('/setToken', auth.check, function(req, res, next) {
    res.status(200).send({ret: ''});
});

router.get('/logout', function(req, res, next) {
    let md = new MobileDetect(req.headers['user-agent']);
    auth.delete(req, res);
    let userNo = 0;
    let adminYn = 'N';
    if (md.mobile()) {
        res.render('templates/main/main-mobile', {userNo: userNo, adminYn: adminYn});
    } else {
        res.render('templates/main/main', {userNo: userNo, adminYn: adminYn});
    }
});

module.exports = router;
