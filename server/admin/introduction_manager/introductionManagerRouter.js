let express = require('express');
let router = express.Router();
let introductionManagerBiz = require('./introductionManagerBiz');

router.get('/', function(req, res, next) {
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    res.render('templates/admin/introduction_manager/introduction_manager', {userNo: userNo, adminYn: adminYn});
});

router.post('/selectIntroduction', function(req, res) {
    if (req.session.adminYn == 'N') {
        res.status(500).send();
    } else {
        let param = req.body;
        introductionManagerBiz.selectIntroduction(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});

router.post('/saveIntroduction', function(req, res) {
    if (req.session.adminYn == 'N') {
        res.status(500).send();
    } else {
        let param = req.body;
        introductionManagerBiz.saveIntroduction(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});

module.exports = router;
