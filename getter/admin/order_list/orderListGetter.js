let express = require('express');
let router = express.Router();
let bodyParser = require('body-parser');
let urlencodedParser = bodyParser.urlencoded({ extended: false });
let fs = require('fs');
let auth = require('../../common/auth');

router.get('/', function(req, res, next) {
    res.render('templates/admin/order_list/order_list', {});
});

module.exports = router;
