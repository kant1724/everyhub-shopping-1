let express = require('express');
let router = express.Router();
let noticeBiz = require('./noticeBiz');
let auth = require('../../common/auth');

router.get('/', function(req, res, next) {
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    res.render('templates/board/notice/notice_list', {userNo: userNo, adminYn: adminYn});
});

router.get('/notice_regist', function(req, res, next) {
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    res.render('templates/board/notice/notice_regist', {userNo: userNo, adminYn: adminYn});
});

router.get('/notice_modify', function(req, res, next) {
    let noticeNo = req.query.noticeNo;
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    res.render('templates/board/notice/notice_modify', {userNo: userNo, adminYn: adminYn, noticeNo: noticeNo});
});

router.post('/selectNoticeList', function(req, res) {
    let param = req.body;
    noticeBiz.selectNoticeList(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

router.post('/selectNoticeDetail', function(req, res) {
    let param = req.body;
    noticeBiz.selectNoticeDetail(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

router.post('/insertNotice', function(req, res) {
    if (req.session.adminYn == 'N') {
        res.status(500).send();
    } else {
        let param = req.body;
        noticeBiz.insertNotice(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});

router.post('/updateNotice', function(req, res) {
    if (req.session.adminYn == 'N') {
        res.status(500).send();
    } else {
        let param = req.body;
        noticeBiz.updateNotice(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});

module.exports = router;
