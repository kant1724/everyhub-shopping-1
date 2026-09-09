let mybatisMapper = require('mybatis-mapper');
let format = {language: 'sql', indent: '  '};
let utils = require('../common/utils');
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
        param.userNo = utils.toSafeInt(param.userNo);
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
        // these all reach the mapper through ${} (raw substitution), so they
        // must be integers before they get anywhere near the statement
        param.lastUserNo = utils.toSafeInt(param.lastUserNo);
        param.limit = utils.toSafeInt(param.limit);
        param.pageSize = utils.toSafeInt(param.pageSize);
        param.pageOffset = utils.toSafeInt(param.pageOffset);
        if (param.pageSize !== null && param.pageOffset === null) {
            param.pageOffset = 0;
        }
        conn.beginTransaction(() => {
            let query = mybatisMapper.getStatement('userSQL', 'selectAllUser', param, format);
            conn.query(query, (err, rows, fields) => {
                callback(rows);
                conn.end();
            });
        });
    },

    selectAllUserCount: function(param, callback) {
        let conn = require('../common/mysql.js').getDBConnection();
        conn.beginTransaction(() => {
            let query = mybatisMapper.getStatement('userSQL', 'selectAllUserCount', param, format);
            conn.query(query, (err, rows, fields) => {
                callback(rows && rows.length > 0 ? rows[0].totalCnt : 0);
                conn.end();
            });
        });
    },

    /**
     * 번호가 이미 가입되어 있는지. 'ok'(가입 가능) | 'not ok'(이미 가입) | 'error'(조회 실패)
     *
     * DB 오류를 삼키면 안 된다. 예전에는 err 를 보지 않고 rows.length 를 읽어서,
     * 연결이 안 되면 콜백이 아예 호출되지 않았다. 그러면 라우터가 응답을 보내지
     * 않아 브라우저가 영구히 기다리고, 화면의 버튼이 멈춘 채로 남는다.
     * 그래서 어떤 경로로 끝나든 callback 과 conn.end() 를 정확히 한 번 실행한다.
     */
    checkDup: function(param, callback) {
        let conn = require('../common/mysql.js').getDBConnection();
        let done = false;
        let finish = function(ret, err) {
            if (done) return;          // 중복 호출 방지 (connection error 와 query error 가 함께 올 수 있다)
            done = true;
            if (err) console.error('[userDao.checkDup] ' + err.code + ': ' + err.message);
            try { conn.end(); } catch (e) { /* 이미 끊겼으면 무시 */ }
            callback(ret);
        };
        // 리스너가 없으면 연결 오류가 프로세스를 죽인다
        conn.on('error', (err) => finish('error', err));
        conn.beginTransaction((txErr) => {
            if (txErr) return finish('error', txErr);
            let query = mybatisMapper.getStatement('userSQL', 'getTelno', param, format);
            conn.query(query, (err, rows, fields) => {
                if (err) return finish('error', err);
                finish(rows && rows.length > 0 ? 'not ok' : 'ok');
            });
        });
    },

    selectSellerInfo: function(param, callback) {
        let conn = require('../common/mysql.js').getDBConnection();
        param.sellerNo = utils.toSafeInt(param.sellerNo);
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
