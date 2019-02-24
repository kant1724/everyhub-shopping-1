let express = require('express');
let router = express.Router();
let MobileDetect = require('mobile-detect');

router.get('/', function(req, res, next) {
    let md = new MobileDetect(req.headers['user-agent']);
    if (md.mobile()) {
        res.render('templates/product/product-mobile', {itemNo: req.query.itemNo});
    } else {
        res.render('templates/product/product', {itemNo: req.query.itemNo});
    }
});

module.exports = router;
