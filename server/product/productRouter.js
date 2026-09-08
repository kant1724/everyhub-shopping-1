let express = require('express');
let router = express.Router();
let productBiz = require('./productBiz');

router.get('/', function(req, res, next) {
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    res.render('templates/product/product', {itemNo: req.query.itemNo, userNo: userNo, adminYn: adminYn});
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
    if (!req.session.userNo) {
        return res.status(403).send({ret: 'not ok'});
    }
    let param = req.body;
    param.userNo = req.session.userNo;
    productBiz.writeQna(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

router.post('/writeQnaReply', function(req, res) {
    // replies are the shop's answers to customer questions
    if (req.session.adminYn !== 'Y') {
        return res.status(403).send({ret: 'not ok'});
    }
    let param = req.body;
    param.userNo = req.session.userNo;
    productBiz.writeQnaReply(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

module.exports = router;
