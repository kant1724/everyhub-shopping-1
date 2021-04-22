let mybatisMapper = require('mybatis-mapper');
let format = {language: 'sql', indent: '  '};
mybatisMapper.createMapper(['server/admin/gallery_manager/galleryManagerSQL.xml']);

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
        let query = mybatisMapper.getStatement('galleryManagerSQL', 'modifyGallery', param, format);
        conn.beginTransaction(() => {
            conn.query(query, (err, rows, fields) => {
                let imagePath1 = param.image1 == 'true' ? 'http://' + param.remoteUrl + '/static/data/shopping/product/' + param.itemNo + '_1.jpg' : '';
                let imagePath2 = param.image2 == 'true' ? 'http://' + param.remoteUrl + '/static/data/shopping/product/' + param.itemNo + '_2.jpg' : '';
                let imagePath3 = param.image3 == 'true' ? 'http://' + param.remoteUrl + '/static/data/shopping/product/' + param.itemNo + '_3.jpg' : '';
                let imagePath4 = param.image4 == 'true' ? 'http://' + param.remoteUrl + '/static/data/shopping/product/' + param.itemNo + '_4.jpg' : '';
                let imagePath5 = param.image5 == 'true' ? 'http://' + param.remoteUrl + '/static/data/shopping/product/' + param.itemNo + '_5.jpg' : '';
                let imagePath6 = param.image6 == 'true' ? 'http://' + param.remoteUrl + '/static/data/shopping/product/' + param.itemNo + '_6.jpg' : '';
                let param2 = {
                    itemNo: param.itemNo,
                    imagePath1: imagePath1,
                    imagePath2: imagePath2,
                    imagePath3: imagePath3,
                    imagePath4: imagePath4,
                    imagePath5: imagePath5,
                    imagePath6: imagePath6
                };
                let query = mybatisMapper.getStatement('galleryManagerSQL', 'updateImagePath', param2, format);
                conn.query(query, (err, rows, fields) => {
                    conn.commit(() => {
                        callback(param.itemNo);
                        conn.end();
                    });
                });
            });
        });
    }
};
