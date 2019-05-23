let express = require('express');
let router = express.Router();
let userManagerBiz = require('./userManagerBiz');
let auth = require('../../common/auth');

router.get('/', function(req, res, next) {
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    res.render('templates/admin/user_manager/user_manager', {userNo: userNo, adminYn: adminYn});
});

router.post('/updateManagerNo', function(req, res) {
    let param = req.body;
    if (req.session.adminYn == 'N') {
        param.userNo = req.session.userNo;
    }
    userManagerBiz.updateManagerNo(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

router.post('/sendSMS', function(req, res) {
    if (req.session.adminYn == 'N') {
        res.status(500).send();
    } else {
        let param = req.body;
        userManagerBiz.sendSMS(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});

module.exports = router;
