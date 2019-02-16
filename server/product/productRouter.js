let express = require('express');
let router = express.Router();
let MobileDetect = require('mobile-detect');

/* GET home page. */
router.get('/', function(req, res, next) {
    let md = new MobileDetect(req.headers['user-agent']);
    if (md.mobile()) {
        res.render('templates/product/product-mobile', { title: 'Express' });
    } else {
        res.render('templates/product/product', { title: 'Express' });
    }
});

module.exports = router;
