let express = require('express');
let router = express.Router();
let MobileDetect = require('mobile-detect');

router.get('/', function(req, res, next) {
    let items = req.query.items;
    let md = new MobileDetect(req.headers['user-agent']);
    if (md.mobile()) {
        res.render('templates/purchase/purchase-mobile', {items: items});
    } else {
        res.render('templates/purchase/purchase', {items: items});
    }
});

module.exports = router;
