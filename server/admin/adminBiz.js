let adminDao = require('./adminDao');

module.exports = {
    registerNewProduct: function(param) {
        let itemNo = adminDao.registerNewProduct(param);
        let imagePath = 'http://' + param.remoteUrl + '/static/data/shopping/product/' + itemNo + ".jpg";
        adminDao.updateImagePath(itemNo, imagePath);

        return itemNo;
    },

    selectProductList: function(param) {
        return adminDao.selectProductList(param);
    },

    selectOneProduct: function(param) {
        return adminDao.selectOneProduct(param);
    },

    modifyProduct: function(param) {
        adminDao.modifyProduct(param);
        if (param.imageChanged) {
            let itemNo = param.itemNo;
            let imagePath = 'http://' + param.remoteUrl + '/static/data/shopping/product/' + itemNo + ".jpg";
            adminDao.updateImagePath(itemNo, imagePath);
        }

        return param.itemNo;
    },
};
