let express = require('express');
let router = express.Router();
let auth = require('../../common/auth');
let orderListBiz = require('./orderListBiz');

router.get('/', auth.requireAdminPage, function(req, res, next) {
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    res.render('templates/admin/order_list/order_list', {userNo: userNo, adminYn: adminYn});
});

router.post('/selectOrderListMain', function(req, res) {
    // Orders carry customer PII, so a session is required. Administrators see
    // every order (userNo = null disables the filter); everyone else is pinned
    // to their own userNo. Never leave userNo undefined — the mapper cannot
    // convert it and the resulting throw would take the process down.
    if (!req.session.userNo) {
        return res.status(403).send({ret: []});
    }
    let param = req.body;
    param.userNo = req.session.adminYn === 'Y' ? null : req.session.userNo;
    // The admin console pages 100 orders at a time and needs the total to
    // render the pager. Callers that send no pageSize (mypage) get the whole
    // result exactly as before.
    orderListBiz.selectOrderListMain(param, (ret) => {
        if (param.pageSize === undefined || param.pageSize === '') {
            return res.status(200).send({ret: ret});
        }
        orderListBiz.selectOrderListMainCount(param, (totalCnt) => {
            res.status(200).send({ret: ret, totalCnt: totalCnt});
        });
    });
});

router.post('/selectOrderListMainByOrderNo', function(req, res) {
    if (!req.session.userNo) {
        return res.status(403).send({ret: []});
    }
    let param = req.body;
    param.userNo = req.session.adminYn === 'Y' ? null : req.session.userNo;
    orderListBiz.selectOrderListMainByOrderNo(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

router.post('/updateDepositConfirmDate', function(req, res) {
    if (req.session.adminYn !== 'Y') {
        res.status(500).send();
    } else {
        let param = req.body;
        orderListBiz.updateDepositConfirmDate(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});

router.post('/updateDlvrConfirmDate', function(req, res) {
    if (req.session.adminYn !== 'Y') {
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
    if (req.session.adminYn !== 'Y') {
        res.status(500).send();
    } else {
        let param = req.body;
        orderListBiz.updateInvoiceNo(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});

router.post('/insertInvoiceNo', function(req, res) {
    if (req.session.adminYn !== 'Y') {
        res.status(500).send();
    } else {
        let param = req.body;
        orderListBiz.insertInvoiceNo(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});

router.post('/deleteInvoiceNo', function(req, res) {
    if (req.session.adminYn !== 'Y') {
        res.status(500).send();
    } else {
        let param = req.body;
        orderListBiz.deleteInvoiceNo(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});

router.post('/selectInvoiceNo', function(req, res) {
   if (!req.session.userNo) {
       return res.status(403).send({ret: []});
   }
   // The invoice number leads to the courier's tracking page, which shows the
   // recipient's name and address, so it must not be readable for someone
   // else's order. Administrators see every invoice; everyone else is limited
   // by the ownership clause in selectInvoiceNo.
   let param = req.body;
   param.adminYn = req.session.adminYn === 'Y' ? 'Y' : 'N';
   param.userNo = req.session.userNo;
   param.telno = req.session.telno || '';
   orderListBiz.selectInvoiceNo(param, (ret) => {
       res.status(200).send({ret: ret});
   });
});

router.post('/updateAdditionalInfo', function(req, res) {
    if (req.session.adminYn !== 'Y') {
        res.status(500).send();
    } else {
        let param = req.body;
        orderListBiz.updateAdditionalInfo(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});

router.post('/sendSMS', function(req, res) {
    if (req.session.adminYn !== 'Y') {
        res.status(500).send();
    } else {
        let param = req.body;
        orderListBiz.sendSMS(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});

router.post('/selectRecentReceiver', function(req, res) {
    if (req.session.adminYn !== 'Y') {
        res.status(500).send();
    } else {
        let param = req.body;
        orderListBiz.selectRecentReceiver(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});


router.post('/selectDepositPersonList', function(req, res) {
    let param = req.body;
    param.userNo = req.session.userNo;
    orderListBiz.selectDepositPersonList(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

module.exports = router;
