let mybatisMapper = require('mybatis-mapper');
let format = {language: 'sql', indent: '  '};
let utils = require('../common/utils');
mybatisMapper.createMapper(['server/product/productSQL.xml']);

module.exports = {
    selectProductReviews: function(param, callback) {
        let conn = require('../common/mysql.js').getDBConnection();
        param.itemNo = utils.toSafeInt(param.itemNo);
        param.lastReviewNo = utils.toSafeInt(param.lastReviewNo);
        param.limit = utils.toSafeInt(param.limit);
        conn.beginTransaction(() => {
            let query = mybatisMapper.getStatement('productSQL', 'selectProductReviews', param, format);
            conn.query(query, (err, rows, fields) => {
                callback(rows);
                conn.end();
            });
        });
    },

    selectQna: function(param, callback) {
        let conn = require('../common/mysql.js').getDBConnection();
        param.itemNo = utils.toSafeInt(param.itemNo);
        param.lastQnaNo = utils.toSafeInt(param.lastQnaNo);
        param.limit = utils.toSafeInt(param.limit);
        conn.beginTransaction(() => {
            let query = mybatisMapper.getStatement('productSQL', 'selectQna', param, format);
            conn.query(query, (err, rows, fields) => {
                callback(rows);
                conn.end();
            });
        });
    },

    selectQnaReply: function(param, callback) {
        let conn = require('../common/mysql.js').getDBConnection();
        param.qnaNo = utils.toSafeInt(param.qnaNo);
        conn.beginTransaction(() => {
            let query = mybatisMapper.getStatement('productSQL', 'selectQnaReply', param, format);
            conn.query(query, (err, rows, fields) => {
                callback(rows);
                conn.end();
            });
        });
    },

    insertQna: function(param, callback) {
        let conn = require('../common/mysql.js').getDBConnection();
        param.itemNo = utils.toSafeInt(param.itemNo);
        param.userNo = utils.toSafeInt(param.userNo);
        conn.beginTransaction(() => {
            let query = mybatisMapper.getStatement('productSQL', 'insertQna', param, format);
            conn.query(query, (err, rows, fields) => {
                conn.commit(() => {
                    callback(rows);
                    conn.end();
                });
            });
        });
    },

    insertQnaReply: function(param, callback) {
        let conn = require('../common/mysql.js').getDBConnection();
        param.qnaNo = utils.toSafeInt(param.qnaNo);
        conn.beginTransaction(() => {
            let query = mybatisMapper.getStatement('productSQL', 'insertQnaReply', param, format);
            conn.query(query, (err, rows, fields) => {
                conn.commit(() => {
                    callback(rows);
                    conn.end();
                });
            });
        });
    }
};
