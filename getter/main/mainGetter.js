let express = require('express');
let auth = require('../common/auth').check;
let router = express.Router();

router.get('/', function(req, res, next) {
    res.render('templates/main/main', {});
});

router.get('/search_result', function(req, res, next) {
    let query = req.query.query;
    res.render('templates/main/search_result', {query: query});
});

module.exports = router;
