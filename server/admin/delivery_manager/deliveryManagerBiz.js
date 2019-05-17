let deliveryManagerDao = require('./deliveryManagerDao');

module.exports = {
    selectShippingInfoList: function(param, callback) {
        deliveryManagerDao.selectShippingInfoList(param, callback);
    },

    selectShippingInfoByZipNo: function(param, callback) {
        deliveryManagerDao.selectShippingInfoByZipNo(param, callback);
    },

    insertShippingInfo: function(param, callback) {
        deliveryManagerDao.insertShippingInfo(param, callback);
    },

    updateShippingInfo: function(param, callback) {
        deliveryManagerDao.updateShippingInfo(param, callback);
    },

    deleteShippingInfo: function(param, callback) {
        deliveryManagerDao.deleteShippingInfo(param, callback);
    }
};
