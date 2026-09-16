let mybatisMapper = require('mybatis-mapper');
let format = {language: 'sql', indent: '  '};
mybatisMapper.createMapper(['server/admin/gallery_manager/galleryManagerSQL.xml']);

// GALLERY 테이블의 IMAGE_PATH_N / IMAGE_DESC_N 슬롯 개수
const SLOT_COUNT = 18;

module.exports = {
    selectGalleryList: function(param, callback) {
        let conn = require('../../common/mysql.js').getDBConnection();
        conn.beginTransaction(() => {
            let query = mybatisMapper.getStatement('galleryManagerSQL', 'selectGalleryList', param, format);
            conn.query(query, (err, rows, fields) => {
                callback(rows);
                conn.end();
            });
        });
    },

    modifyGallery: function(param, callback) {
        let conn = require('../../common/mysql.js').getDBConnection();
        let param2 = {};
        for (let i = 1; i <= SLOT_COUNT; ++i) {
            param2['imagePath' + i] = param['image' + i] == 'true'
                ? 'http://' + param.remoteUrl + '/static/data/shopping/product/gallery_' + i + '.jpg'
                : '';
            param2['imageDesc' + i] = param['imageDesc' + i] || '';
        }
        let query = mybatisMapper.getStatement('galleryManagerSQL', 'updateImagePath', param2, format);
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
