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

router.post('/productNew/registerNewProduct', function(req, res) {
    let param = req.body
    adminBiz.registerNewProduct(param, ret => {
        res.status(200).send({ret: ret});
    });
});

router.post('/selectProductList', function(req, res) {
    let param = req.body
    adminBiz.selectProductList(param, ret => {
        res.status(200).send({ret: ret});
    });
});

module.exports = router;
