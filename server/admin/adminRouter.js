let express = require('express');
let router = express.Router();
let bodyParser = require('body-parser');
let urlencodedParser = bodyParser.urlencoded({ extended: false });
let adminBiz = require('./adminBiz');
let formidable = require('formidable');
let fs = require('fs');

router.get('/', function(req, res, next) {
    res.render('templates/admin/productMain', {});
});

router.get('/productNew', function(req, res, next) {
    res.render('templates/admin/productNew', {});
});

router.post('/productNew/registerNewProduct', function(req, res) {
    let form = new formidable.IncomingForm();
    let time = Date.now();
    let imagePath = 'views/static/images/' + time + ".jpg";
    form.parse(req, (err, fields, files) => {
        console.log(fields);
        fields.imagePath = imagePath;
        adminBiz.registerNewProduct(fields, ret => {
            res.status(200).send({ret: ret});
        });
    });
    form.on('fileBegin', (name, file) => {
        file.path = imagePath;
    });
    form.on('file', (name, file) => {
    });

});

module.exports = router;
