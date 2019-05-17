let mybatisMapper = require('mybatis-mapper');
let format = {language: 'sql', indent: '  '};
let utils = require('../common/utils');
let sms = require('../common/sms');
mybatisMapper.createMapper(['server/purchase/purchaseSQL.xml']);

module.exports = {
    insertOrderList: function(param, callback) {
        let conn = require('../common/mysql.js').getDBConnection();
        conn.beginTransaction(() => {
            let query = mybatisMapper.getStatement('purchaseSQL', 'insertOrderListMain', param.orderListMain, format);
            conn.query(query, (err, rows, fields) => {
                let orderNo = rows.insertId;
                let orderListDetail = param.orderListDetail;
                param.orderListMain.orderNo = orderNo;
                this.sendSms(param);
                for (let i = 0; i < orderListDetail.length; ++i) {
                    orderListDetail[i].orderNo = orderNo;
                    orderListDetail[i].orderSeq = i + 1;
                }
                query = mybatisMapper.getStatement('purchaseSQL', 'insertOrderListDetail', param, format);
                conn.query(query, (err, rows, fields) => {
                    conn.commit(() => {
                        callback(rows);
                        conn.end();
                    });
                });
            });
        });
    },

    sendSms: function(param) {
        let p = param.orderListMain;
        let msg = '주문이 신청되었습니다.\n';
        msg += '주문번호: ' + p.orderNo + '\n';
        msg += '주문자: ' + p.orderPersonNm + '\n';
        msg += '주문자 연락처: ' + p.orderTelno + '\n';
        msg += '받는자명: ' + p.receivePersonNm + '\n';
        msg += '받는자 주소: ' + p.receiveZipNo + ' '  + p.receiveAddressMain + ' ' + p.receiveAddressDetail + '\n';
        msg += '총 주문금액: ' + utils.numberWithCommas(p.totalPrice) + '원 \n';
        msg += '입금계좌번호: ' + p.acno + ' \n';
        //console.log(msg);
        let productNm = param.orderListDetail[0].itemNm + ' ' + param.orderListDetail[0].optionNm;
        let d = {};
        for (let i = 0; i < param.orderListDetail.length; ++i) {
            d[param.orderListDetail[i].itemNm] = param.orderListDetail[i].damageRemarks;
        }
        if (param.orderListDetail.length > 1) {
            productNm += ' 외 ' + (param.orderListDetail.length - 1) + '건';
        }
        msg += '주문내역: ' + productNm;
        sms.sendSMS('주문이 완료되었습니다.', msg, p.orderTelno);
        for (let n in d) {
            let damageRemarks = d[n];
            sms.sendSMS('파손시 조치내용', n + ' 파손시 조치내용:\n' + damageRemarks, p.orderTelno);
        }
    }
};
