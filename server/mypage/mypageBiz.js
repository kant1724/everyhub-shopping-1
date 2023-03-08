let mypageDao = require('./mypageDao');
let sms = require('../common/sms');

module.exports = {
    writeReview: function(param, callback) {
        mypageDao.insertReview(param, callback);
    },

    updateUser: function(param, callback) {
        mypageDao.updateUser(param, callback);
    },

    cancelOrder: function(param, callback) {
        let orderNo = param.orderNo;
        let telno = param.telno;
        let msg = '주문번호 ' + orderNo + '번의 주문이 취소되었습니다.\n';
        sms.sendSMS('주문이 취소되었습니다.', msg, telno);
        mypageDao.cancelOrder(param, callback);
    },

    updateOrderList: function(param, callback) {
        mypageDao.updateOrderList(param, callback);
    },

    updateOrderListByAdmin: function(param, callback) {
        mypageDao.updateOrderListByAdmin(param, callback);
    }
};
