let express = require('express');
let router = express.Router();
let MobileDetect = require('mobile-detect');
let auth = require('../common/auth');

router.get('/', function(req, res, next) {
    let md = new MobileDetect(req.headers['user-agent']);
    param.userNo = auth.getUserNo(req);
    param.adminYn = auth.getAdminYn(req);
    if (md.mobile()) {
        res.render('templates/user/login-mobile', {userNo: userNo, adminYn: adminYn});
    } else {
        res.render('templates/user/login', {userNo: userNo, adminYn: adminYn});
    }
});

router.get('/sign_up', function(req, res, next) {
    let md = new MobileDetect(req.headers['user-agent']);
    param.userNo = auth.getUserNo(req);
    param.adminYn = auth.getAdminYn(req);
    if (md.mobile()) {
        res.render('templates/user/sign_up-mobile', {userNo: userNo, adminYn: adminYn});
    } else {
        res.render('templates/user/sign_up', {userNo: userNo, adminYn: adminYn});
    }
});

router.post('/setToken', auth.check, function(req, res, next) {
    res.status(200).send({ret: ''});
});

module.exports = router;
