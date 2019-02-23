let express = require('express');
let router = express.Router();

router.get('/', function(req, res, next) {
    res.render('templates/user/login', {});
});

router.get('/sign_up', function(req, res, next) {
    res.render('templates/user/sign_up', {});
});

module.exports = router;
