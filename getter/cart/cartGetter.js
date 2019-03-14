let express = require('express');
let router = express.Router();
let MobileDetect = require('mobile-detect');
let auth = require('../common/auth');

router.get('/', function(req, res, next) {
    let md = new MobileDetect(req.headers['user-agent']);
    if (md.mobile()) {
        res.render('templates/cart/cart-mobile', {});
    } else {
        res.render('templates/cart/cart', {});
    }
});

module.exports = router;
