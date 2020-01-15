let express = require('express');
let MobileDetect = require('mobile-detect');
let router = express.Router();
let userBiz = require('./userBiz');
let auth = require('../common/auth');


router.get('/', function(req, res, next) {
    let md = new MobileDetect(req.headers['user-agent']);
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    if (md.mobile()) {
        res.render('templates/user/login-mobile', {userNo: userNo, adminYn: adminYn});
    } else {
        res.render('templates/user/login', {userNo: userNo, adminYn: adminYn});
    }
});

router.get('/sign_up', function(req, res, next) {
    let md = new MobileDetect(req.headers['user-agent']);
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    if (md.mobile()) {
        res.render('templates/user/sign_up-mobile', {userNo: userNo, adminYn: adminYn});
    } else {
        res.render('templates/user/sign_up', {userNo: userNo, adminYn: adminYn});
    }
});

router.get('/get_password', function(req, res, next) {
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    res.render('templates/user/get_password', {userNo: userNo, adminYn: adminYn});
});

router.get('/logout', function(req, res, next) {
    let md = new MobileDetect(req.headers['user-agent']);
    let userNo = 0;
    let adminYn = 'N';
    req.session.destroy(function(){
        req.session;
    });
    if (md.mobile()) {
        res.render('templates/main/main-mobile', {userNo: userNo, adminYn: adminYn});
    } else {
        res.render('templates/main/main', {userNo: userNo, adminYn: adminYn});
    }
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
    let param = req.body;
    //param.userNo = req.session.userNo;
    userBiz.selectUser(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

router.post('/selectAllUser', function(req, res) {
    let param = req.body;
    param.userNo = req.session.userNo;
    userBiz.selectAllUser(param, (ret) => {
        res.status(200).send({ret: ret});
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
