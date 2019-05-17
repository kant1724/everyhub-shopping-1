let express = require('express');
let router = express.Router();
let deliveryManagerBiz = require('./deliveryManagerBiz');

module.exports = router;

router.get('/', function(req, res, next) {
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    res.render('templates/admin/delivery_manager/delivery_manager', {userNo: userNo, adminYn: adminYn});
});

router.post('/selectShippingInfoList', function(req, res) {
    if (req.session.adminYn == 'N') {
        res.status(500).send();
    } else {
        let param = req.body;
        deliveryManagerBiz.selectShippingInfoList(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});

router.post('/selectShippingInfoByZipNo', function(req, res) {
    if (req.session.adminYn == 'N') {
        res.status(500).send();
    } else {
        let param = req.body;
        deliveryManagerBiz.selectShippingInfoByZipNo(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});

router.post('/insertShippingInfo', function(req, res) {
    if (req.session.adminYn == 'N') {
        res.status(500).send();
    } else {
        let param = req.body;
        deliveryManagerBiz.insertShippingInfo(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});

router.post('/updateShippingInfo', function(req, res) {
    if (req.session.adminYn == 'N') {
        res.status(500).send();
    } else {
        let param = req.body;
        deliveryManagerBiz.updateShippingInfo(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});

router.post('/deleteShippingInfo', function(req, res) {
    if (req.session.adminYn == 'N') {
        res.status(500).send();
    } else {
        let param = req.body;
        deliveryManagerBiz.deleteShippingInfo(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});
