let orderListDao = require('./userManagerDao');

module.exports = {
    updateManagerNo: function(param, callback) {
        orderListDao.updateManagerNo(param, callback);
    }
};
