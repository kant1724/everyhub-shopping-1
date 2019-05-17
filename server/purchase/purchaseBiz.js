let purchaseDao = require('./purchaseDao');

module.exports = {
    insertOrderList: function(param, callback) {
        purchaseDao.insertOrderList(param, callback);
    }
};
