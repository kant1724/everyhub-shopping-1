let noticeDao = require('./noticeDao');
let sms = require('../../common/sms');

module.exports = {
    selectNoticeList: function(param, callback) {
         noticeDao.selectNoticeList(param, callback);
    },

    selectNoticeDetail: function(param, callback) {
         noticeDao.selectNoticeDetail(param, callback);
    },

    insertNotice: function(param, callback) {
        noticeDao.insertNotice(param, callback);
    },

    updateNotice: function(param, callback) {
        noticeDao.updateNotice(param, callback);
    }
};
