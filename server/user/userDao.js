let mybatisMapper = require('mybatis-mapper');
let format = {language: 'sql', indent: '  '};
mybatisMapper.createMapper(['server/user/userSQL.xml']);

module.exports = {
    insertUser: function(param, callback) {
        let conn = require('../common/mysql.js').getDBConnection();
        conn.beginTransaction(() => {
            let query = mybatisMapper.getStatement('userSQL', 'getTelno', param, format);
            conn.query(query, (err, rows, fields) => {
                if (rows.length > 0) {
                    callback('not ok');
                } else {
                    let query = mybatisMapper.getStatement('userSQL', 'insertUser', param, format);
                    conn.query(query, (err, rows, fields) => {
                        conn.commit(() => {
                            callback(rows);
                            conn.end();
                        });
                    });
                }
            });
        });
    },

    getPassword: function(param, callback) {
        let conn = require('../common/mysql.js').getDBConnection();
        conn.beginTransaction(() => {
            let query = mybatisMapper.getStatement('userSQL', 'getPassword', param, format);
            conn.query(query, (err, rows, fields) => {
                callback(rows);
            });
        });
    },

    updateCertificationCode: function(param) {
        let conn = require('../common/mysql.js').getDBConnection();
        conn.beginTransaction(() => {
            let query = mybatisMapper.getStatement('userSQL', 'updateCertificationCode', param, format);
            conn.query(query, (err, rows, fields) => {
                conn.commit(() => {
                    conn.end();
                });
            });
        });
    },

    selectUser: function(param, callback) {
        let conn = require('../common/mysql.js').getDBConnection();
        conn.beginTransaction(() => {
            let query = mybatisMapper.getStatement('userSQL', 'selectUser', param, format);
            conn.query(query, (err, rows, fields) => {
                callback(rows);
                conn.end();
            });
        });
    },

    selectAllUser: function(param, callback) {
        let conn = require('../common/mysql.js').getDBConnection();
        conn.beginTransaction(() => {
            let query = mybatisMapper.getStatement('userSQL', 'selectAllUser', param, format);
            conn.query(query, (err, rows, fields) => {
                callback(rows);
                conn.end();
            });
        });
    },

    checkDup: function(param, callback) {
        let conn = require('../common/mysql.js').getDBConnection();
        conn.beginTransaction(() => {
            let query = mybatisMapper.getStatement('userSQL', 'getTelno', param, format);
            conn.query(query, (err, rows, fields) => {
                if (rows.length > 0) {
                    callback('not ok');
                } else {
                    callback('ok');
                }
                conn.end();
            });
        });
    },

    selectSellerInfo: function(param, callback) {
        let conn = require('../common/mysql.js').getDBConnection();
        conn.beginTransaction(() => {
            let query = mybatisMapper.getStatement('userSQL', 'selectSellerInfo', param, format);
            conn.query(query, (err, rows, fields) => {
                callback(rows);
                conn.end();
            });
        });
    },

    confirmCertificationCode: function(param, callback) {
        let conn = require('../common/mysql.js').getDBConnection();
        conn.beginTransaction(() => {
            let query = mybatisMapper.getStatement('userSQL', 'getCertificationCode', param, format);
            conn.query(query, (err, rows, fields) => {
                callback(rows);
                conn.end();
            });
        });
    },

    modifyPassword: function(param, callback) {
        let conn = require('../common/mysql.js').getDBConnection();
        conn.beginTransaction(() => {
            let query = mybatisMapper.getStatement('userSQL', 'modifyPassword', param, format);
            conn.query(query, (err, rows, fields) => {
                conn.commit(() => {
                    callback(rows);
                    conn.end();
                });
            });
        });
    }
};
