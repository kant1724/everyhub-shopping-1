let knex = require('knex')(require('../common/properties').getDBProperties());

module.exports = {
    selectProductList: function(param) {
        let ret = knex('items').select(
            'item_no',
            'item_nm_1',
            'item_nm_2',
            'price',
            'item_kcd',
            'origin_cd',
            'image_path',
            'item_desc',
        );
        return ret;
    },

    selectOneProduct: function(param) {
        let ret = knex('items').select(
            'item_no',
            'item_nm_1',
            'item_nm_2',
            'price',
            'item_kcd',
            'origin_cd',
            'image_path',
            'item_desc',
        ).where({'item_no' : param.itemNo});
        return ret;
    },

    modifyProduct: function(param) {
    let ret = knex('items').where('item_no', param.itemNo)
        .update({
            item_nm_1 : param.itemNm1,
            item_nm_2 : param.itemNm2,
            price : param.price,
            item_kcd : param.itemKcd,
            origin_cd : param.originCd,
            item_desc: param.itemDesc
        });
        return ret;
    },

    registerNewProduct: function(param) {
        let ret = knex('items').insert({
            item_nm_1: param.itemNm1,
            item_nm_2: param.itemNm2,
            price: param.price,
            item_kcd: param.itemKcd,
            origin_cd: param.originCd,
            item_desc: param.itemDesc
        });
        return ret;
    },

    updateImagePath: function(itemNo, imagePath) {
        let ret = knex('items').where('item_no', itemNo)
            .update({
                image_path: imagePath,
            });
        return ret;
    }
};
