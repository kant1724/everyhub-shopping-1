let express = require('express');
let router = express.Router();
let mypageBiz = require('./mypageBiz');
let MobileDetect = require('mobile-detect');

router.get('/', function(req, res, next) {
    let md = new MobileDetect(req.headers['user-agent']);
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    if (userNo == null) {
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
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    let orderNo = req.query.orderNo;
    if (userNo != null) {
        if (md.mobile()) {
            res.render('templates/mypage/modify-mobile', {userNo: userNo, adminYn: adminYn, orderNo: orderNo});
        } else {
            let gubun = req.query.gubun;
            res.render('templates/mypage/modify', {userNo: userNo, adminYn: adminYn, orderNo: orderNo, gubun: gubun});
        }
    }
});

router.post('/writeReview', function(req, res) {
    let param = req.body;
    param.userNo = req.session.userNo;
    mypageBiz.writeReview(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

router.post('/updateUser', function(req, res) {
    let param = req.body;
    param.userNo = req.session.userNo;
    mypageBiz.updateUser(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

router.post('/cancelOrder', function(req, res) {
    let param = req.body;
    param.userNo = req.session.userNo;
    param.telno = req.session.telno;
    mypageBiz.cancelOrder(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

router.post('/updateOrderList', function(req, res) {
    let json = req.body.data;
    let param = JSON.parse(json);
    if (req.session.adminYn == 'N') {
        param.orderListMain.userNo = req.session.userNo;
        param.orderListMain.telno = req.session.telno;
    }
    mypageBiz.updateOrderList(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

module.exports = router;
