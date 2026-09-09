let mybatisMapper = require('mybatis-mapper');
let format = {language: 'sql', indent: '  '};
let utils = require('../common/utils');
let sms = require('../common/sms');
mybatisMapper.createMapper(['server/purchase/purchaseSQL.xml']);

module.exports = {
    insertOrderList: function(param, callback) {
        let conn = require('../common/mysql.js').getDBConnection();
        param.orderListMain.totalPrice = utils.toSafeInt(param.orderListMain.totalPrice);
        param.orderListMain.sellerNo = utils.toSafeInt(param.orderListMain.sellerNo);
        param.orderListMain.userNo = utils.toSafeInt(param.orderListMain.userNo);
        param.orderListDetail.forEach((d) => {
            d.itemNo = utils.toSafeInt(d.itemNo);
            d.optionNo = utils.toSafeInt(d.optionNo);
            d.qty = utils.toSafeInt(d.qty);
        });
        // The browser can be told a product is sold out and still post the order
        // (an old tab, a stale cart, a hand-made request), so the stock rule is
        // re-checked here against the current row before anything is inserted.
        // Nobody is exempt, administrators included, matching the product page.
        conn.beginTransaction(() => {
            let query = mybatisMapper.getStatement('purchaseSQL', 'selectItems', param, format);
            conn.query(query, (err, rows, fields) => {
                for (let i = 0; i < param.orderListDetail.length; ++i) {
                    let orderItemNo = param.orderListDetail[i].itemNo;
                    let orderOptionNo = param.orderListDetail[i].optionNo;
                    let orderOptionNm = param.orderListDetail[i].optionNm;
                    let orderItemPrice = param.orderListDetail[i].itemPriceNum;
                    let has = false;
                    for (let j = 0; j < rows.length; ++j) {
                        if (orderItemNo == rows[j].itemNo && orderOptionNo ==  rows[j].optionNo) {
                            has = true;
                            if (orderOptionNm != rows[j].optionNm || orderItemPrice != rows[j].itemPrice) {
                                callback('diff item');
                                conn.end();
                                return;
                            }
                            if (rows[j].soldOutYn == 'Y' || rows[j].shipYn != 'Y') {
                                callback('sold out');
                                conn.end();
                                return;
                            }
                        }
                    }
                    if (!has) {
                        callback('diff item');
                        conn.end();
                        return;
                    }
                }
                // 주문 시점의 입금 계좌를 주문 행에 함께 남긴다. 나중에 판매자가
                // 계좌를 바꿔도 과거 주문에는 그때 안내한 계좌가 그대로 남는다.
                // 화면이 올려준 값은 믿지 않고 여기서 SELLER 을 직접 읽는다.
                query = mybatisMapper.getStatement('purchaseSQL', 'selectSellerAcno', param.orderListMain, format);
                conn.query(query, (err, rows, fields) => {
                    let seller = (rows && rows.length > 0) ? rows[0] : {};
                    param.orderListMain.sellerAcno = seller.sellerAcno || '';
                    param.orderListMain.sellerDepositPersonNm = seller.sellerDepositPersonNm || '';

                    query = mybatisMapper.getStatement('purchaseSQL', 'insertOrderListMain', param.orderListMain, format);
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
            });
        });
    },

    sendSms: function(param) {
        let p = param.orderListMain;

        if (p.orderTelno == '01091006870' || p.orderTelno == '01094278169') {
            return;
        }

        let msg = '주문이 신청되었습니다.\n';
        msg += '주문번호: ' + p.orderNo + '\n';
        msg += '주문자: ' + p.orderPersonNm + '\n';
        msg += '주문자 연락처: ' + p.orderTelno + '\n';
        msg += '받는자명: ' + p.receivePersonNm + '\n';
        msg += '받는자 주소: ' + p.receiveZipNo + ' '  + p.receiveAddressMain + ' ' + p.receiveAddressDetail + '\n';
        msg += '총 주문금액: ' + utils.numberWithCommas(p.totalPrice) + '원 \n';
        msg += '입금계좌번호: \n' + p.sellerAcno + '\n' + p.sellerDepositPersonNm + ' \n';
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
        /**
        for (let n in d) {
            let damageRemarks = d[n];
            sms.sendSMS('파손시 조치내용', n + ' 파손시 조치내용:\n' + damageRemarks, p.orderTelno);
        }
        **/
    }
};
