let express = require('express');
let router = express.Router();
let bodyParser = require('body-parser');
let urlencodedParser = bodyParser.urlencoded({ extended: false });
let adminBiz = require('./adminBiz');
let formidable = require('formidable');
let fs = require('fs');

router.get('/', function(req, res, next) {
    res.render('templates/admin/productMain', {});
});

router.get('/productNew', function(req, res, next) {
    res.render('templates/admin/productNew', {});
});

router.get('/productModification', function(req, res, next) {
    let itemNo = req.query.itemNo;
    res.render('templates/admin/productModification', {itemNo : itemNo});
});

router.post('/productNew/registerNewProduct', function(req, res) {
    let param = req.body
    adminBiz.registerNewProduct(param, ret => {
        res.status(200).send({ret: ret});
    });
});

router.post('/productModification/selectOneProduct', function(req, res) {
    let param = req.body
    adminBiz.selectOneProduct(param, ret => {
        res.status(200).send({ret: ret});
    });
});

router.post('/productModification/modifyProduct', function(req, res) {
    let param = req.body
    adminBiz.modifyProduct(param, ret => {
        res.status(200).send({ret: ret});
    });
})

router.post('/selectProductList', function(req, res) {
    let param = req.body;
    let ret = adminBiz.selectProductList(param);
    res.status(200).send({ret: ret});
});

module.exports = router;
