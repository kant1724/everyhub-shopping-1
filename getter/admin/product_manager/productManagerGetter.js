let express = require('express');
let router = express.Router();
let bodyParser = require('body-parser');
let urlencodedParser = bodyParser.urlencoded({ extended: false });
let fs = require('fs');
let auth = require('../../common/auth');

router.get('/', function(req, res, next) {
    let userNo = auth.getUserNo(req);
    let adminYn = auth.getAdminYn(req);
    res.render('templates/admin/product_manager/product_manager', {userNo: userNo, adminYn: adminYn});
});

router.get('/product_new', function(req, res, next) {
    let userNo = auth.getUserNo(req);
    let adminYn = auth.getAdminYn(req);
    res.render('templates/admin/product_manager/product_manager_new', {userNo: userNo, adminYn: adminYn});
});

router.get('/product_modify', function(req, res, next) {
    let itemNo = req.query.itemNo;
    let userNo = auth.getUserNo(req);
    let adminYn = auth.getAdminYn(req);
    res.render('templates/admin/product_manager/product_manager_modify', {itemNo : itemNo, userNo: userNo, adminYn: adminYn});
});

module.exports = router;
