let adminDao = require('./adminDao');

module.exports = {
    registerNewProduct: function(param, cb) {
        adminDao.registerNewProduct(param).then(ret => {
            cb(ret)
        });
    }
};
