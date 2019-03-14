let express = require('express');
let router = express.Router();
let MobileDetect = require('mobile-detect');
let auth = require('../common/auth');

router.get('/', function(req, res, next) {
    let param = req.query;
    param.userNo = auth.getUserNo(req);
    param.adminYn = auth.getAdminYn(req);
    let md = new MobileDetect(req.headers['user-agent']);
    if (md.mobile()) {
        res.render('templates/purchase/purchase-mobile', param);
    } else {
        res.render('templates/purchase/purchase', param);
    }
});

module.exports = router;
