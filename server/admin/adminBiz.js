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
    }
};
