let introductionManagerDao = require('./introductionManagerDao');

module.exports = {
    selectIntroduction: function(param, callback) {
        introductionManagerDao.selectIntroduction(param, callback);
    },

    saveIntroduction: function(param, callback) {
        introductionManagerDao.saveIntroduction(param, callback);
    }
};
