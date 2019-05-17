let itemManagerDao = require('./itemManagerDao');

module.exports = {
    registerNewItem: function(param, callback) {
        itemManagerDao.registerNewItem(param, callback);
    },

    selectItemList: function(param, callback) {
        itemManagerDao.selectItemList(param, callback);
    },

    selectOneItem: function(param, callback) {
        itemManagerDao.selectOneItem(param, callback);
    },

    modifyItem: function(param, callback) {
        itemManagerDao.modifyItem(param, callback);
    },

    deleteItem: function(param, callback) {
        itemManagerDao.deleteItem(param, callback);
    },

    selectItemOption: function(param, callback) {
        itemManagerDao.selectItemOption(param, callback);
    },

    insertItemOption: function(param, callback) {
        itemManagerDao.insertItemOption(param, callback);
    },

    updateItemOption: function(param, callback) {
        itemManagerDao.updateItemOption(param, callback);
    },

    deleteItemOption: function(param, callback) {
        itemManagerDao.deleteItemOption(param, callback);
    }
};
