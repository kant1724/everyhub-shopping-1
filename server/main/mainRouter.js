let express = require('express');
let router = express.Router();

router.get('/', function(req, res, next) {
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    res.render('templates/main/main', {userNo: userNo, adminYn: adminYn});
});

router.get('/introduction', function(req, res, next) {
    let query = req.query.query;
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    res.render('templates/main/introduction', {query: query, userNo: userNo, adminYn: adminYn});
});

router.get('/search_result', function(req, res, next) {
    let query = req.query.query;
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    res.render('templates/main/search_result', {query: query, userNo: userNo, adminYn: adminYn});
});

router.get('/personal_information_policy', function(req, res, next) {
    let query = req.query.query;
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    res.render('templates/main/personal_information_policy', {query: query, userNo: userNo, adminYn: adminYn});
});

module.exports = router;
