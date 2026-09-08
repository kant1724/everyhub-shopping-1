let express = require('express');
let router = express.Router();
let auth = require('../../common/auth');
let deliveryManagerBiz = require('./deliveryManagerBiz');

module.exports = router;

router.get('/', auth.requireAdminPage, function(req, res, next) {
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    res.render('templates/admin/delivery_manager/delivery_manager', {userNo: userNo, adminYn: adminYn});
});

router.post('/selectShippingInfoList', function(req, res) {
    if (req.session.adminYn !== 'Y') {
        res.status(500).send();
    } else {
        let param = req.body;
        deliveryManagerBiz.selectShippingInfoList(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});

// 우편번호별 추가배송비 조회는 고객이 결제 화면에서 금액을 계산할 때 쓴다.
// 개인정보가 없는 요금표 조회라 로그인한 사용자면 허용한다.
// (배송지 목록 전체 조회 · 등록 · 수정 · 삭제는 관리자 전용을 유지)
router.post('/selectShippingInfoByZipNo', function(req, res) {
    if (!req.session.userNo) {
        res.status(403).send({ret: []});
    } else {
        let param = req.body;
        deliveryManagerBiz.selectShippingInfoByZipNo(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});

router.post('/insertShippingInfo', function(req, res) {
    if (req.session.adminYn !== 'Y') {
        res.status(500).send();
    } else {
        let param = req.body;
        deliveryManagerBiz.insertShippingInfo(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});

router.post('/updateShippingInfo', function(req, res) {
    if (req.session.adminYn !== 'Y') {
        res.status(500).send();
    } else {
        let param = req.body;
        deliveryManagerBiz.updateShippingInfo(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});

router.post('/deleteShippingInfo', function(req, res) {
    if (req.session.adminYn !== 'Y') {
        res.status(500).send();
    } else {
        let param = req.body;
        deliveryManagerBiz.deleteShippingInfo(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});
