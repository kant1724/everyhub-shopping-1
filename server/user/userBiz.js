let moment = require('moment');
let userDao = require('./userDao');
let sms = require('../common/sms');

module.exports = {
    goSigningUp: function(param, callback) {
        userDao.insertUser(param, callback);
    },

    login: function(param, callback) {
        userDao.getPassword(param, (res) => {
            if (res == null || res.length == 0) {
                callback(null);
            } else if (param.password == res[0].password) {
                callback(res[0]);
            } else {
                callback(null);
            }
        });
    },

    selectUser: function(param, callback) {
        userDao.selectUser(param, callback);
    },

    selectAllUser: function(param, callback) {
        userDao.selectAllUser(param, callback);
    },

    checkDup: function(param, callback) {
        userDao.checkDup(param, callback);
    },

    selectSellerInfo: function(param, callback) {
        userDao.selectSellerInfo(param, callback);
    },

    getCertificationCode: function(param, callback) {
        userDao.getPassword(param, (res) => {
            if (res == null || res.length == 0) {
                callback('not ok');
            } else {
                let certificationCode = Math.floor((Math.random() * 100000) + 1);
                param.certificationCode = certificationCode;
                let telno = param.telno;
                let title = '인증번호 전송';
                let msg = '간드락농원 인증번호는 ' + certificationCode + ' 입니다.';
                console.log(telno);
                sms.sendSMS2(title, msg, telno)
                userDao.updateCertificationCode(param);
                callback('ok');
            }
        });
    },

    confirmCertificationCode: function(param, callback) {
        userDao.confirmCertificationCode(param, (ret) => {
            if (ret == null || ret.length == 0) {
                callback('not ok');
            } else {
                console.log(ret);
                if (ret[0].certificationCode == param.certificationCode) {
                    callback('ok');
                } else {
                    callback('not ok');
                }
            }
        });
    },

    modifyPassword: function(param, callback) {
        userDao.modifyPassword(param, (ret) => {
            console.log(param.password);
            if (ret.affectedRows == 0) {
                callback('not ok');
            } else {
                callback('ok');
            }
        });
    }
};
