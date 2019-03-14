let express = require('express');
let router = express.Router();
let MobileDetect = require('mobile-detect');
let auth = require('../common/auth');

router.get('/', function(req, res, next) {
    let md = new MobileDetect(req.headers['user-agent']);
    let userNo = auth.getUserNo(req);
    let adminYn = auth.getAdminYn(req);
    if (md.mobile()) {
        res.render('templates/cart/cart-mobile', {userNo: userNo, adminYn: adminYn});
    } else {
        res.render('templates/cart/cart', {userNo: userNo, adminYn: adminYn});
    }
});

module.exports = router;
