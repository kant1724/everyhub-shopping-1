let express = require('express');
let router = express.Router();
let auth = require('../../common/auth');
let galleryManagerBiz = require('./galleryManagerBiz');

router.get('/', auth.requireAdminPage, function(req, res, next) {
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    res.render('templates/admin/gallery_manager/gallery_manager', {userNo: userNo, adminYn: adminYn});
});

router.post('/selectGalleryList', function(req, res) {    let param = req.body;
    galleryManagerBiz .selectGalleryList(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

router.post('/modifyGallery', function(req, res) {
    if (req.session.adminYn !== 'Y') {
        res.status(500).send();
    } else {
        let param = req.body;
        galleryManagerBiz .modifyGallery(param, () => {
            res.status(200).send({});
        });
    }
});

module.exports = router;
