let orderListDao = require('./userManagerDao');
let sms = require('../../common/sms');

module.exports = {
    updateManagerNo: function(param, callback) {
        orderListDao.updateManagerNo(param, callback);
    },

    sendSMS: function(param, callback) {
        let telno = param.smsTelno.split(';');
        for (let i = 0; i < telno.length; ++i) {
            console.log(telno[i] + ' ' + param.smsSubject + ' ' + param.smsContent)
            sms.sendSMS2(param.smsSubject, param.smsContent, telno[i]);
        }
        callback('');
    }
};
