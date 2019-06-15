let mybatisMapper = require('mybatis-mapper');
let format = {language: 'sql', indent: '  '};
mybatisMapper.createMapper(['server/admin/introduction_manager/introductionManagerSQL.xml']);

module.exports = {
    selectIntroduction: function(param, callback) {
        let conn = require('../../common/mysql.js').getDBConnection();
        conn.beginTransaction(() => {
            let query = mybatisMapper.getStatement('introductionManagerSQL', 'selectIntroduction', param, format);
            conn.query(query, (err, rows, fields) => {
                callback(rows);
                conn.end();
            });
        });
    },

    saveIntroduction: function(param, callback) {
        let conn = require('../../common/mysql.js').getDBConnection();
        conn.beginTransaction(() => {
            let query = mybatisMapper.getStatement('introductionManagerSQL', 'saveIntroduction', param, format);
            conn.query(query, (err, rows, fields) => {
                conn.commit(() => {
                    callback(rows);
                    conn.end();
                });
            });
        });
    }
};
