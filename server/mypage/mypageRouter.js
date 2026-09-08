let express = require('express');
let router = express.Router();
let mypageBiz = require('./mypageBiz');

router.get('/', function(req, res, next) {
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    if (userNo == null) {
        res.render('templates/user/login', {userNo: userNo, adminYn: adminYn});
    } else {
        res.render('templates/mypage/mypage', {userNo: userNo, adminYn: adminYn});
    }
});

router.get('/modify', function(req, res, next) {
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    let orderNo = req.query.orderNo;
    // gubun tells the page whether the edit came from the admin order list.
    // The old mobile branch rendered without it, so on a phone an admin edit
    // silently saved through the customer path instead.
    let gubun = req.query.gubun;
    if (userNo != null) {
        res.render('templates/mypage/modify', {userNo: userNo, adminYn: adminYn, orderNo: orderNo, gubun: gubun});
    }
});

// Everything below acts on the signed-in customer's own data.
function requireLogin(req, res) {
    if (!req.session.userNo) {
        res.status(403).send({ret: 'not ok'});
        return false;
    }
    return true;
}

router.post('/writeReview', function(req, res) {
    if (!requireLogin(req, res)) return;
    let param = req.body;
    param.userNo = req.session.userNo;
    mypageBiz.writeReview(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

router.post('/updateUser', function(req, res) {
    if (!requireLogin(req, res)) return;
    let param = req.body;
    param.userNo = req.session.userNo;
    mypageBiz.updateUser(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

router.post('/cancelOrder', function(req, res) {
    if (!requireLogin(req, res)) return;
    let param = req.body;
    param.userNo = req.session.userNo;
    // never leave a mapper parameter undefined — it throws inside a DB callback
    param.telno = req.session.telno || '';
    param.adminYn = req.session.adminYn === 'Y' ? 'Y' : 'N';
    mypageBiz.cancelOrder(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

router.post('/updateOrderList', function(req, res) {
    if (!requireLogin(req, res)) return;
    let json = req.body.data;
    let param = JSON.parse(json);
    if (req.session.adminYn !== 'Y') {
        param.orderListMain.userNo = req.session.userNo;
        param.orderListMain.telno = req.session.telno;
    }
    mypageBiz.updateOrderList(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

router.post('/updateOrderListByAdmin', function(req, res) {
    // the admin variant skips the ownership pin, so it must be admin-only
    if (req.session.adminYn !== 'Y') {
        return res.status(403).send({ret: 'not ok'});
    }
    let json = req.body.data;
    let param = JSON.parse(json);
    mypageBiz.updateOrderListByAdmin(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

module.exports = router;
