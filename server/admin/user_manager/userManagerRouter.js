let express = require('express');
let router = express.Router();
let orderListBiz = require('./userManagerBiz');
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
    orderListBiz.updateManagerNo(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

module.exports = router;
