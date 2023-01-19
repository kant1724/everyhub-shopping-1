let express = require('express');
let router = express.Router();
let orderListBiz = require('./orderListBiz');
let auth = require('../../common/auth');

router.get('/', function(req, res, next) {
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    res.render('templates/admin/order_list/order_list', {userNo: userNo, adminYn: adminYn});
});

router.post('/selectOrderListMain', function(req, res) {
    let param = req.body;
    if (req.session.adminYn == 'Y') {
        param.userNo = null
    }
    orderListBiz.selectOrderListMain(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

router.post('/selectOrderListMainByOrderNo', function(req, res) {
    let param = req.body;
    if (req.session.adminYn == 'N') {
        param.userNo = req.session.userNo;
    }
    orderListBiz.selectOrderListMainByOrderNo(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

router.post('/updateDepositConfirmDate', function(req, res) {
    if (req.session.adminYn == 'N') {
        res.status(500).send();
    } else {
        let param = req.body;
        orderListBiz.updateDepositConfirmDate(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});

router.post('/updateDlvrConfirmDate', function(req, res) {
    if (req.session.adminYn == 'N') {
        res.status(500).send();
    } else {
        let json = req.body.data;
        let param = JSON.parse(json);
        orderListBiz.updateDlvrConfirmDate(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});

router.post('/updateInvoiceNo', function(req, res) {
    if (req.session.adminYn == 'N') {
        res.status(500).send();
    } else {
        let param = req.body;
        orderListBiz.updateInvoiceNo(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});

router.post('/insertInvoiceNo', function(req, res) {
    if (req.session.adminYn == 'N') {
        res.status(500).send();
    } else {
        let param = req.body;
        orderListBiz.insertInvoiceNo(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});

router.post('/deleteInvoiceNo', function(req, res) {
    if (req.session.adminYn == 'N') {
        res.status(500).send();
    } else {
        let param = req.body;
        orderListBiz.deleteInvoiceNo(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});

router.post('/selectInvoiceNo', function(req, res) {
    if (req.session.adminYn == 'N') {
        res.status(500).send();
    } else {
        let param = req.body;
        orderListBiz.selectInvoiceNo(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});

router.post('/updateAdditionalInfo', function(req, res) {
    if (req.session.adminYn == 'N') {
        res.status(500).send();
    } else {
        let param = req.body;
        orderListBiz.updateAdditionalInfo(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});

router.post('/sendSMS', function(req, res) {
    if (req.session.adminYn == 'N') {
        res.status(500).send();
    } else {
        let param = req.body;
        orderListBiz.sendSMS(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});

router.post('/selectRecentReceiver', function(req, res) {
    let param = req.body;
    if (req.session.adminYn == 'N') {
        param.userNo = auth.getUserNo(req);
    }
    orderListBiz.selectRecentReceiver(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});


router.post('/selectDepositPersonList', function(req, res) {
    let param = req.body;
    param.userNo = auth.getUserNo(req);
    orderListBiz.selectDepositPersonList(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

module.exports = router;
