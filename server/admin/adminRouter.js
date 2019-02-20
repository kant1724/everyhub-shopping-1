let express = require('express');
let router = express.Router();
let bodyParser = require('body-parser');
let urlencodedParser = bodyParser.urlencoded({ extended: false });
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

module.exports = router;
