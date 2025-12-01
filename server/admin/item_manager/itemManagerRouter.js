let express = require('express');
let router = express.Router();
let itemManagerBiz = require('./itemManagerBiz');

router.get('/', function(req, res, next) {
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    res.render('templates/admin/item_manager/item_manager', {userNo: userNo, adminYn: adminYn});
});

router.get('/item_new', function(req, res, next) {
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    res.render('templates/admin/item_manager/item_manager_new', {userNo: userNo, adminYn: adminYn});
});

router.get('/item_modify', function(req, res, next) {
    let itemNo = req.query.itemNo;
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    if (adminYn == 'N') {
        res.status(500).send();
    } else {
        res.render('templates/admin/item_manager/item_manager_modify', {itemNo : itemNo, userNo: userNo, adminYn: adminYn});
    }
});

router.get('/item_option', function(req, res, next) {
    let itemNo = req.query.itemNo;
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    res.render('templates/admin/item_manager/item_option', {itemNo: itemNo, userNo: userNo, adminYn: adminYn});
});

router.post('/registerNewItem', function(req, res) {
    if (req.session.adminYn == 'N') {
        res.status(500).send();
    } else {
        let param = req.body;
        itemManagerBiz.registerNewItem(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});

router.post('/modifyItem', function(req, res) {
    if (req.session.adminYn == 'N') {
        res.status(500).send();
    } else {
        let param = req.body;
        itemManagerBiz.modifyItem(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});

router.post('/deleteItem', function(req, res) {
    if (req.session.adminYn == 'N') {
        res.status(500).send();
    } else {
        let param = req.body;
        itemManagerBiz.deleteItem(param, (ret) => {
            res.status(200).send({ret: ret});
        });
    }
});

router.post('/selectOneItem', function(req, res) {
    let param = req.body;
    itemManagerBiz.selectOneItem(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

router.post('/selectItemList', function(req, res) {    let param = req.body;
    itemManagerBiz.selectItemList(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

router.post('/selectItemOption', function(req, res) {
    let param = req.body;
    itemManagerBiz.selectItemOption(param, (ret) => {
        res.status(200).send({ret: ret});
    });
});

router.post('/insertItemOption', function(req, res) {
    let itemNo = req.query.itemNo;
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    if (adminYn == 'N') {
        res.status(500).send();
    } else {
        let param = req.body;
        itemManagerBiz.insertItemOption(param, () => {
            res.status(200).send({});
        });
    }
});

router.post('/updateItemOption', function(req, res) {
    let itemNo = req.query.itemNo;
    let userNo = req.session.userNo;
    let adminYn = req.session.adminYn;
    if (adminYn == 'N') {
        res.status(500).send();
    } else {
        let param = req.body;
        itemManagerBiz.updateItemOption(param, () => {
            res.status(200).send({});
        });
    }
});

router.post('/deleteItemOption', function(req, res) {
    let param = req.body;
    itemManagerBiz.deleteItemOption(param, () => {
        res.status(200).send({});
    });
});

module.exports = router;
