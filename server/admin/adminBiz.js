let adminDao = require('./adminDao');

module.exports = {
    registerNewProduct: function(param, cb) {
        let itemNo;
        adminDao.registerNewProduct(param).then(ret => {
            itemNo = ret;
            let imagePath = 'http://' + param.remoteUrl + '/static/data/shopping/product/' + itemNo + ".jpg";
            return adminDao.updateImagePath(ret, imagePath);
        })
        .then(ret => {
            cb(itemNo);
        });
    },

    selectProductList: function(param, cb) {
        adminDao.selectProductList(param).then(ret => {
            cb(ret);
        })
    },

    selectOneProduct: function(param, cb) {
        adminDao.selectOneProduct(param).then(ret => {
            cb(ret);
        })
    },

    modifyProduct: function(param, cb) {
        let itemNo;
        let res = adminDao.modifyProduct(param).then(ret => {
            if (param.imageChanged) {
                itemNo = param.itemNo;
                let imagePath = 'http://' + param.remoteUrl + '/static/data/shopping/product/' + itemNo + ".jpg";
                return adminDao.updateImagePath(itemNo, imagePath);
            } else {
                cb(ret);
            }
        });
        if (!param.imageChanged) {
            return;
        }
        res.then(ret => {
            cb(itemNo);
        });
    },
};
