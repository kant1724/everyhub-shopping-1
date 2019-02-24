let express = require('express');
let auth = require('../common/auth').check;
let router = express.Router();

router.get('/', function(req, res, next) {
    res.render('templates/user/login', {});
});

router.get('/sign_up', function(req, res, next) {
    res.render('templates/user/sign_up', {});
});

router.post('/setToken', auth, function(req, res, next) {
    res.status(200).send({ret: ''});
});

module.exports = router;
