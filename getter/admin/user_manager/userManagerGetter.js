let express = require('express');
let router = express.Router();
let bodyParser = require('body-parser');
let urlencodedParser = bodyParser.urlencoded({ extended: false });
let fs = require('fs');
let auth = require('../../common/auth');

router.get('/', function(req, res, next) {
    let userNo = auth.getUserNo(req);
    let adminYn = auth.getAdminYn(req);
    res.render('templates/admin/user_manager/user_manager', {userNo: userNo, adminYn: adminYn});
});

module.exports = router;
