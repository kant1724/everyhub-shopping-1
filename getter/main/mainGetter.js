let express = require('express');
let router = express.Router();

router.get('/', function(req, res, next) {
    res.render('templates/main/main', {});
});

module.exports = router;
