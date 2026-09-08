let express = require('express');
let router = express.Router();

router.get('/', function(req, res, next) {
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    res.render('templates/cart/cart', {userNo: userNo, adminYn: adminYn});
});

module.exports = router;
