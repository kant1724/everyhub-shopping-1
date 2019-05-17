let productDao = require('./productDao');

module.exports = {
    selectProductReviews: function(param, callback) {
        productDao.selectProductReviews(param, callback);
    },

    selectQna: function(param, callback) {
        productDao.selectQna(param, callback);
    },

    selectQnaReply: function(param, callback) {
        productDao.selectQnaReply(param, callback);
    },

    writeQna: function(param, callback) {
        productDao.insertQna(param, callback);
    },

    writeQnaReply: function(param, callback) {
        productDao.insertQnaReply(param, callback);
    }
};
