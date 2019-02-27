let express = require('express');
let router = express.Router();

router.get('/', function(req, res, next) {
    let items = req.query.items;
    res.render('templates/purchase/purchase', {items: items});
});

module.exports = router;
