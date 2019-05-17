let express = require('express');
let router = express.Router();
let MobileDetect = require('mobile-detect');
let auth = require('../common/auth');

router.get('/', function(req, res, next) {
    let param = req.query;
    //let userNo = auth.getUserNo(req);
    //let adminYn = auth.getAdminYn(req);
    //param.userNo = auth.getUserNo(req);
    //param.adminYn = auth.getAdminYn(req);
    let userNo = param.userNo;
    let adminYn = param.adminYn;

    let md = new MobileDetect(req.headers['user-agent']);
    if (userNo == 0) {
        param = JSON.stringify(param);
        if (md.mobile()) {
            res.render('templates/user/login-mobile', {userNo: userNo, adminYn: adminYn, param: param, gubun: 'purchase'});
        } else {
            res.render('templates/user/login', {userNo: userNo, adminYn: adminYn, param: param, gubun: 'purchase'});
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
    //param.userNo = auth.getUserNo(req);
    //param.adminYn = auth.getAdminYn(req);
    res.render('templates/purchase/purchase_complete', param);
});

module.exports = router;
