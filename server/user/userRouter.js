let express = require('express');
let router = express.Router();
let userBiz = require('./userBiz');
let phoneVerification = require('../common/phoneVerification');


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

/**
 * 회원가입 휴대폰 본인인증 - 인증번호 발송.
 * 인증 상태는 요청한 브라우저의 세션에만 남긴다.
 */
router.post('/sendSignUpCode', function(req, res) {
    userBiz.sendSignUpCode(req.body, req.session, (ret) => {
        res.status(200).send({ret: ret});
    });
});

/** 회원가입 휴대폰 본인인증 - 인증번호 확인 */
router.post('/confirmSignUpCode', function(req, res) {
    userBiz.confirmSignUpCode(req.body, req.session, (ret) => {
        res.status(200).send({ret: ret});
    });
});

router.post('/goSigningUp', function(req, res) {
    let param = req.body;
    // 본인인증을 통과한 번호로만 가입할 수 있다. 화면에서 버튼을 막는 것만으로는
    // 이 API 를 직접 호출하는 경우를 막지 못하므로 서버에서 다시 확인한다.
    let telno = phoneVerification.normalizeTelno(param.telno);
    if (telno == null || !phoneVerification.isVerified(req.session.signUpCert, telno)) {
        return res.status(200).send({ret: 'not verified'});
    }
    // 인증한 번호와 저장할 번호가 어긋나지 않도록 세 토막도 서버에서 만든다.
    let parts = phoneVerification.splitTelno(telno);
    param.telno = telno;
    param.telno1 = parts.telno1;
    param.telno2 = parts.telno2;
    param.telno3 = parts.telno3;
    userBiz.goSigningUp(param, (ret) => {
        if (ret !== 'not ok') {
            // 인증 표시를 지워 같은 세션으로 다시 가입하지 못하게 한다
            delete req.session.signUpCert;
        }
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
