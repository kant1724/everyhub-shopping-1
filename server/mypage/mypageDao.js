let mybatisMapper = require('mybatis-mapper');
let format = {language: 'sql', indent: '  '};
mybatisMapper.createMapper(['server/mypage/mypageSQL.xml']);

module.exports = {
    insertReview: function(param, callback) {
        let conn = require('../common/mysql.js').getDBConnection();
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
        conn.beginTransaction(() => {
            let query = mybatisMapper.getStatement('mypageSQL', 'updateOrderList', param.orderListMain, format);
            conn.query(query, (err, rows, fields) => {
                conn.commit(() => {
                    callback(rows);
                    conn.end();
                });
            });
        });
    }
};
