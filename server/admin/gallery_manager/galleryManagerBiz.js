let galleryManagerDao = require('./galleryManagerDao');

module.exports = {
    selectGalleryList: function(param, callback) {
        galleryManagerDao.selectGalleryList(param, callback);
    },

    modifyGallery: function(param, callback) {
        galleryManagerDao.modifyGallery(param, callback);
    }
};
