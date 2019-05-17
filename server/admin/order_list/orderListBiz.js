let orderListDao = require('./orderListDao');
let sms = require('../../common/sms');

module.exports = {
    selectOrderListMain: function(param, callback) {
         orderListDao.selectOrderListMain(param, callback);
    },

    selectOrderListMainByOrderNo: function(param, callback) {
        orderListDao.selectOrderListMainByOrderNo(param, callback);
    },

    updateDepositConfirmDate: function(param, callback) {
        orderListDao.updateDepositConfirmDate(param, callback);
    },

    updateDlvrConfirmDate: function(param, callback) {
        for (let i = 0; i < param.orderListDetail.length; ++i) {
            let orderNo = param.orderListDetail[i].orderNo;
            let itemNm = param.orderListDetail[i].itemNm;
            let optionNm = param.orderListDetail[i].optionNm;
            let orderTelno = param.orderListDetail[i].orderTelno;
            let msg = '주문번호 ' + orderNo + '번의 배송이 시작되었습니다.\n';
            msg += '상품명: ' + itemNm + '\n';
            msg += '옵션명: ' + optionNm + '\n';
            sms.sendSMS('배송이 시작되었습니다.', msg, orderTelno);
        }
        orderListDao.updateDlvrConfirmDate(param, callback);
    },

    updateInvoiceNo: function(param, callback) {
        orderListDao.updateInvoiceNo(param, callback);
    },

    insertInvoiceNo: function(param, callback) {
        orderListDao.insertInvoiceNo(param, callback);
    },

    deleteInvoiceNo: function(param, callback) {
        orderListDao.deleteInvoiceNo(param, callback);
    },

    selectInvoiceNo: function(param, callback) {
        orderListDao.selectInvoiceNo(param, callback);
    },

    updateAdditionalInfo: function(param, callback) {
        orderListDao.updateAdditionalInfo(param, callback);
    },

    sendSMS: function(param, callback) {
        sms.sendSMS2(param.smsSubject, param.smsContent, param.smsTelno);
        callback('');
    },

    selectRecentReceiver: function(param, callback) {
        orderListDao.selectRecentReceiver(param, callback);
    }
};
