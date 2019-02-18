let mybatisMapper = require('mybatis-mapper');
let format = {language: 'sql', indent: '  '};
mybatisMapper.createMapper(['server/admin/adminSQL.xml']);
conn = require('../common/mysql.js').getDBConnection();

module.exports = {
    selectProductList: function(param) {
        let query = mybatisMapper.getStatement('adminSQL', 'selectProductList', param, format);

        return conn.query(query);
    },

    selectOneProduct: function(param) {
        let query = mybatisMapper.getStatement('adminSQL', 'selectOneProduct', param, format);

        return conn.query(query);
    },

    modifyProduct: function(param) {
        let query = mybatisMapper.getStatement('adminSQL', 'modifyProduct', param, format);

        return conn.query(query);
    },

    registerNewProduct: function(param) {
        let query = mybatisMapper.getStatement('adminSQL', 'registerNewProduct', param, format);
        let ret = conn.query(query);

        return ret.insertId;
    },

    updateImagePath: function(itemNo, imagePath) {
        let param = {
            itemNo : itemNo,
            imagePath : imagePath
        }
        let query = mybatisMapper.getStatement('adminSQL', 'updateImagePath', param, format);

        return conn.query(query);
    }
};
