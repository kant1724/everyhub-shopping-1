let express = require('express');
let router = express.Router();
let userBiz = require('./userBiz');
let auth = require('../common/auth');


router.get('/', function(req, res, next) {
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    res.render('templates/user/login', {userNo: userNo, adminYn: adminYn});
});

router.get('/sign_up', function(req, res, next) {
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    res.render('templates/user/sign_up', {userNo: userNo, adminYn: adminYn});
});

router.get('/get_password', function(req, res, next) {
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    res.render('templates/user/get_password', {userNo: userNo, adminYn: adminYn});
});

router.get('/logout', function(req, res, next) {
    let userNo = 0;
    let adminYn = 'N';
    req.session.destroy(function(){
        req.session;
    });
    res.render('templates/main/main', {userNo: userNo, adminYn: adminYn});
});

router.post('/goSigningUp', function(req, res) {
    let param = req.body;
    userBiz.goSigningUp(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

router.post('/login', function(req, res) {
    let param = req.body;
    userBiz.login(param, (ret) => {
        if (ret != null) {
            console.log(req.session)
            req.session.userNo = ret.userNo;
            req.session.adminYn = ret.adminYn ? ret.adminYn : 'N';
            req.session.telno = ret.telno;
            res.status(200).send({ret: 'ok'});
        } else {
            res.status(200).send({ret: 'not ok'});
        }
    });
});

router.post('/selectUser', function(req, res) {
    // A caller may only read their own record. Admins may read a specific one.
    if (!req.session.userNo) {
        return res.status(403).send({ret: []});
    }
    let param = req.body;
    if (req.session.adminYn !== 'Y') {
        param.userNo = req.session.userNo;
    }
    userBiz.selectUser(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

router.post('/selectAllUser', function(req, res) {
    // Returns every customer record — administrators only.
    if (req.session.adminYn !== 'Y') {
        return res.status(403).send({ret: []});
    }
    let param = req.body;
    param.userNo = req.session.userNo;
    // When the console asks for a page, send the total alongside it so the
    // pager knows how many pages there are without a second round trip.
    userBiz.selectAllUser(param, (ret) => {
        if (param.pageSize === undefined || param.pageSize === '') {
            return res.status(200).send({ret: ret});
        }
        userBiz.selectAllUserCount(param, (totalCnt) => {
            res.status(200).send({ret: ret, totalCnt: totalCnt});
        });
    });
});

router.post('/checkDup', function(req, res) {
    let param = req.body;
    param.userNo = req.session.userNo;
    userBiz.checkDup(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

router.post('/selectSellerInfo', function(req, res) {
    let param = req.body;
    param.userNo = req.session.userNo;;
    userBiz.selectSellerInfo(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

router.post('/getCertificationCode', function(req, res) {
    let param = req.body;
    param.userNo = req.session.userNo;
    userBiz.getCertificationCode(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

router.post('/confirmCertificationCode', function(req, res) {
    let param = req.body;
    param.userNo = req.session.userNo;
    userBiz.confirmCertificationCode(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

router.post('/modifyPassword', function(req, res) {
    let param = req.body;
    param.userNo = req.session.userNo;
    userBiz.modifyPassword(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

module.exports = router;
