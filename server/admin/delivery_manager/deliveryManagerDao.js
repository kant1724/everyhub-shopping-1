let mybatisMapper = require('mybatis-mapper');
let format = {language: 'sql', indent: '  '};
mybatisMapper.createMapper(['server/admin/delivery_manager/deliveryManagerSQL.xml']);

module.exports = {
    selectShippingInfoList: function(param, callback) {
        let conn = require('../../common/mysql.js').getDBConnection();
        let query = mybatisMapper.getStatement('deliveryManagerSQL', 'selectShippingInfoList', param, format);
        conn.beginTransaction(() => {
            conn.query(query, (err, rows, fields) => {
                conn.commit(() => {
                    callback(rows);
                    conn.end();
                });
            });
        });
    },

    selectShippingInfoByZipNo: function(param, callback) {
        let conn = require('../../common/mysql.js').getDBConnection();
        let query = mybatisMapper.getStatement('deliveryManagerSQL', 'selectShippingInfoByZipNo', param, format);
        conn.beginTransaction(() => {
            conn.query(query, (err, rows, fields) => {
                conn.commit(() => {
                    callback(rows);
                    conn.end();
                });
            });
        });
    },

    insertShippingInfo: function(param, callback) {
        let conn = require('../../common/mysql.js').getDBConnection();
        let query = mybatisMapper.getStatement('deliveryManagerSQL', 'insertShippingInfo', param, format);
        conn.beginTransaction(() => {
            conn.query(query, (err, rows, fields) => {
                conn.commit(() => {
                    callback('');
                    conn.end();
                });
            });
        });
    },

    updateShippingInfo: function(param, callback) {
        let conn = require('../../common/mysql.js').getDBConnection();
        let query = mybatisMapper.getStatement('deliveryManagerSQL', 'updateShippingInfo', param, format);
        conn.beginTransaction(() => {
            conn.query(query, (err, rows, fields) => {
                conn.commit(() => {
                    callback('');
                    conn.end();
                });
            });
        });
    },

    deleteShippingInfo: function(param, callback) {
        let conn = require('../../common/mysql.js').getDBConnection();
        let query = mybatisMapper.getStatement('deliveryManagerSQL', 'deleteShippingInfo', param, format);
        conn.beginTransaction(() => {
            conn.query(query, (err, rows, fields) => {
                conn.commit(() => {
                    callback();
                    conn.end();
                });
            });
        });
    }
};
