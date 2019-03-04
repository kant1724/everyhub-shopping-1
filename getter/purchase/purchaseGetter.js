let express = require('express');
let router = express.Router();
let MobileDetect = require('mobile-detect');

router.get('/', function(req, res, next) {
    let param = req.query;
    let md = new MobileDetect(req.headers['user-agent']);
    if (md.mobile()) {
        res.render('templates/purchase/purchase-mobile', param);
    } else {
        res.render('templates/purchase/purchase', param);
    }
});

module.exports = router;
