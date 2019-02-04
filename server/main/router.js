var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('templates/main', { title: 'Express' });
});

router.get('/whatMain', function(req, res) {
    var ret = require('./main').whatMain(
        function callback(ret) {
            res.status(200).send({res: JSON.stringify(ret)});
        });
});

module.exports = router;
