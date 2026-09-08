let mybatisMapper = require('mybatis-mapper');
let format = {language: 'sql', indent: '  '};
let utils = require('../common/utils');
mybatisMapper.createMapper(['server/mypage/mypageSQL.xml']);

module.exports = {
    insertReview: function(param, callback) {
        let conn = require('../common/mysql.js').getDBConnection();
        param.star = utils.toSafeInt(param.star);
        param.itemNo = utils.toSafeInt(param.itemNo);
        param.userNo = utils.toSafeInt(param.userNo);
        conn.beginTransaction(() => {
            let query = mybatisMapper.getStatement('mypageSQL', 'insertReview', param, format);
            conn.query(query, (err, rows, fields) => {
                conn.commit(() => {
                    callback(rows);
                    conn.end();
                });
            });
        });
    },

    updateUser: function(param, callback) {
        let conn = require('../common/mysql.js').getDBConnection();
        param.userNo = utils.toSafeInt(param.userNo);
        conn.beginTransaction(() => {
            let query = mybatisMapper.getStatement('mypageSQL', 'updateUser', param, format);
            conn.query(query, (err, rows, fields) => {
                conn.commit(() => {
                    callback(rows);
                    conn.end();
                });
            });
        });
    },

    cancelOrder: function(param, callback) {
        let conn = require('../common/mysql.js').getDBConnection();
        param.orderNo = utils.toSafeInt(param.orderNo);
        conn.beginTransaction(() => {
            let query = mybatisMapper.getStatement('mypageSQL', 'cancelOrder', param, format);
            conn.query(query, (err, rows, fields) => {
                conn.commit(() => {
                    callback(rows);
                    conn.end();
                });
            });
        });
    },

    updateOrderList: function(param, callback) {
        let conn = require('../common/mysql.js').getDBConnection();
        param.orderListMain.orderNo = utils.toSafeInt(param.orderListMain.orderNo);
        param.orderListMain.userNo = utils.toSafeInt(param.orderListMain.userNo);
        conn.beginTransaction(() => {
            let query = mybatisMapper.getStatement('mypageSQL', 'updateOrderList', param.orderListMain, format);
            conn.query(query, (err, rows, fields) => {
                conn.commit(() => {
                    callback(rows);
                    conn.end();
                });
            });
        });
    },

    updateOrderListByAdmin: function(param, callback) {
        let conn = require('../common/mysql.js').getDBConnection();
        param.orderListMain.orderNo = utils.toSafeInt(param.orderListMain.orderNo);
        param.orderListMain.userNo = utils.toSafeInt(param.orderListMain.userNo);
        conn.beginTransaction(() => {
            let query = mybatisMapper.getStatement('mypageSQL', 'updateOrderList', param.orderListMain, format);
            conn.query(query, (err, rows, fields) => {
                let query2 = mybatisMapper.getStatement('mypageSQL', 'updateDlvrConfirmDate', param.orderListMain, format);
                conn.query(query2, (err, rows, fields) => {
                    conn.commit(() => {
                        callback(rows);
                        conn.end();
                    });
                });
            });
        });
    }
};
