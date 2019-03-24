let express = require('express');
let router = express.Router();
let MobileDetect = require('mobile-detect');
let auth = require('../common/auth');

router.get('/', function(req, res, next) {
    let param = req.query;
    param.userNo = auth.getUserNo(req);
    param.adminYn = auth.getAdminYn(req);
    let md = new MobileDetect(req.headers['user-agent']);
    if (param.userNo == 0) {
        let userNo = auth.getUserNo(req);
        let adminYn = auth.getAdminYn(req);
        if (md.mobile()) {
            res.render('templates/user/login-mobile', {userNo: userNo, adminYn: adminYn});
        } else {
            res.render('templates/user/login', {userNo: userNo, adminYn: adminYn});
        }
    } else {
        if (md.mobile()) {
            res.render('templates/purchase/purchase-mobile', param);
        } else {
            res.render('templates/purchase/purchase', param);
        }
    }
});

router.get('/purchase_complete', function(req, res, next) {
    let param = req.query;
    param.userNo = auth.getUserNo(req);
    param.adminYn = auth.getAdminYn(req);
    res.render('templates/purchase/purchase_complete', param);
});

module.exports = router;
