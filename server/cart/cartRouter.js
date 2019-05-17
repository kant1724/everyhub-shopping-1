let express = require('express');
let router = express.Router();
let MobileDetect = require('mobile-detect');

router.get('/', function(req, res, next) {
    let md = new MobileDetect(req.headers['user-agent']);
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    if (md.mobile()) {
        res.render('templates/cart/cart-mobile', {userNo: userNo, adminYn: adminYn});
    } else {
        res.render('templates/cart/cart', {userNo: userNo, adminYn: adminYn});
    }
});

module.exports = router;
