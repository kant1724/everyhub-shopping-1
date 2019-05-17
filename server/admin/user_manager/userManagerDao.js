let mybatisMapper = require('mybatis-mapper');
let format = {language: 'sql', indent: '  '};
mybatisMapper.createMapper(['server/admin/user_manager/userManagerSQL.xml']);

module.exports = {
    updateManagerNo: function(param, callback) {
        let conn = require('../../common/mysql.js').getDBConnection();
        conn.beginTransaction(() => {
            let query = mybatisMapper.getStatement('userManagerSQL', 'selectManagerNo', param, format);
            conn.query(query, (err, rows, fields) => {
                console.log(rows);
                if (rows == null || rows.length == 0) {
                    callback('not ok');
                } else {
                    param.managerNo = rows[0].managerNo;
                    console.log(param.managerNo);
                    let query = mybatisMapper.getStatement('userManagerSQL', 'updateManagerNo', param, format);
                    conn.query(query, (err, rows, fields) => {
                        conn.commit(() => {
                            callback('ok');
                            conn.end();
                        });
                    });
                }
            });
        });
    }
};
