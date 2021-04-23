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
        let imagePath1 = param.image1 == 'true' ? 'http://' + param.remoteUrl + '/static/data/shopping/product/gallery_1.jpg' : '';
        let imagePath2 = param.image2 == 'true' ? 'http://' + param.remoteUrl + '/static/data/shopping/product/gallery_2.jpg' : '';
        let imagePath3 = param.image3 == 'true' ? 'http://' + param.remoteUrl + '/static/data/shopping/product/gallery_3.jpg' : '';
        let imagePath4 = param.image4 == 'true' ? 'http://' + param.remoteUrl + '/static/data/shopping/product/gallery_4.jpg' : '';
        let imagePath5 = param.image5 == 'true' ? 'http://' + param.remoteUrl + '/static/data/shopping/product/gallery_5.jpg' : '';
        let imagePath6 = param.image6 == 'true' ? 'http://' + param.remoteUrl + '/static/data/shopping/product/gallery_6.jpg' : '';
        let imagePath7 = param.image7 == 'true' ? 'http://' + param.remoteUrl + '/static/data/shopping/product/gallery_7.jpg' : '';
        let imagePath8 = param.image8 == 'true' ? 'http://' + param.remoteUrl + '/static/data/shopping/product/gallery_8.jpg' : '';
        let imagePath9 = param.image9 == 'true' ? 'http://' + param.remoteUrl + '/static/data/shopping/product/gallery_9.jpg' : '';
        let param2 = {
            imagePath1: imagePath1,
            imagePath2: imagePath2,
            imagePath3: imagePath3,
            imagePath4: imagePath4,
            imagePath5: imagePath5,
            imagePath6: imagePath6,
            imagePath7: imagePath7,
            imagePath8: imagePath8,
            imagePath9: imagePath9
        };
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
