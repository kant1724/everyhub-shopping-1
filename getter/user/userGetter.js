let express = require('express');
let router = express.Router();
let MobileDetect = require('mobile-detect');
let auth = require('../common/auth');

router.get('/', function(req, res, next) {
    let md = new MobileDetect(req.headers['user-agent']);
    if (md.mobile()) {
        res.render('templates/user/login-mobile', {});
    } else {
        res.render('templates/user/login', {});
    }
});

router.get('/sign_up', function(req, res, next) {
    let md = new MobileDetect(req.headers['user-agent']);
    if (md.mobile()) {
        res.render('templates/user/sign_up-mobile', {});
    } else {
        res.render('templates/user/sign_up', {});
    }
});

router.post('/setToken', auth, function(req, res, next) {
    res.status(200).send({ret: ''});
});

module.exports = router;
