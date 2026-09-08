let express = require('express');
let router = express.Router();
let auth = require('../../common/auth');
let introductionManagerBiz = require('./introductionManagerBiz');

router.get('/', auth.requireAdminPage, function(req, res, next) {
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    res.render('templates/admin/introduction_manager/introduction_manager', {userNo: userNo, adminYn: adminYn});
});

// 소개글은 /introduction 공개 페이지에 그대로 노출되는 내용이므로 조회는 공개한다.
// (저장은 아래처럼 관리자 전용을 유지한다)
router.post('/selectIntroduction', function(req, res) {
    let param = req.body;
    introductionManagerBiz.selectIntroduction(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

router.post('/saveIntroduction', function(req, res) {
    if (req.session.adminYn !== 'Y') {
        res.status(500).send();
    } else {
        let param = req.body;
        introductionManagerBiz.saveIntroduction(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});

module.exports = router;
