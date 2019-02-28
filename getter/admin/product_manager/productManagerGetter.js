let express = require('express');
let router = express.Router();
let bodyParser = require('body-parser');
let urlencodedParser = bodyParser.urlencoded({ extended: false });
let fs = require('fs');

router.get('/', function(req, res, next) {
    res.render('templates/admin/product_manager/product_manager', {});
});

router.get('/product_new', function(req, res, next) {
    res.render('templates/admin/product_manager/product_manager_new', {});
});

router.get('/product_modify', function(req, res, next) {
    let itemNo = req.query.itemNo;
    res.render('templates/admin/product_manager/product_manager_modify', {itemNo : itemNo});
});

module.exports = router;
