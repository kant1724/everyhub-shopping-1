let express = require('express');
let MobileDetect = require('mobile-detect');
let router = express.Router();
let purchaseBiz = require('./purchaseBiz');

router.get('/', function(req, res, next) {
    let param = req.query;
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    param.userNo = req.session.userNo;
    param.adminYn = req.session.adminYn;

    let md = new MobileDetect(req.headers['user-agent']);
    if (userNo == null) {
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
    param.userNo = req.session.userNo;
    param.adminYn = req.session.adminYn;
    res.render('templates/purchase/purchase_complete', param);
});

router.post('/insertOrderList', function(req, res) {
    let json = req.body.data;
    let param = JSON.parse(json);
    param.orderListMain.userNo = req.session.userNo;
    if (param.orderListMain.userNo == 0) {
        res.status(200).send({ret: 'not ok'});
    } else {
        purchaseBiz.insertOrderList(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});

module.exports = router;
