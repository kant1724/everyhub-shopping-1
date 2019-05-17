let express = require('express');
let router = express.Router();
let MobileDetect = require('mobile-detect');
let productBiz = require('./productBiz');

router.get('/', function(req, res, next) {
    let md = new MobileDetect(req.headers['user-agent']);
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    if (md.mobile()) {
        res.render('templates/product/product-mobile', {itemNo: req.query.itemNo, userNo: userNo, adminYn: adminYn});
    } else {
        res.render('templates/product/product', {itemNo: req.query.itemNo, userNo: userNo, adminYn: adminYn});
    }
});

router.post('/selectProductReviews', function(req, res) {
    let param = req.body;
    productBiz.selectProductReviews(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

router.post('/selectQna', function(req, res) {
    let param = req.body;
    productBiz.selectQna(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

router.post('/selectQnaReply', function(req, res) {
    let param = req.body;
    productBiz.selectQnaReply(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

router.post('/writeQna', function(req, res) {
    let param = req.body;
    param.userNo = req.session.userNo;
    productBiz.writeQna(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

router.post('/writeQnaReply', function(req, res) {
    let param = req.body;
    param.userNo = req.session.userNo;
    productBiz.writeQnaReply(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

module.exports = router;
