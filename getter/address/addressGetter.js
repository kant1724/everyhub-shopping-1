let express = require('express');
let auth = require('../common/auth').check;
let router = express.Router();
let MobileDetect = require('mobile-detect');

router.get('/', function(req, res, next) {
	let md = new MobileDetect(req.headers['user-agent']);
	if (md.mobile()) {
		//res.render('templates/user/sign_up-mobile', {});
	} else {
		res.render('templates/address/address', {});
	}
});

module.exports = router;
