let adminDao = require('./adminDao');

module.exports = {
    registerNewProduct: function(param, cb) {
        let itemNo;
        adminDao.registerNewProduct(param).then(ret => {
            itemNo = ret;
            let imagePath = 'views/static/images/' + itemNo + ".jpg";
            return adminDao.updateImagePath(ret, imagePath);
        })
        .then(ret => {
            cb(itemNo);
        });
    }
};
