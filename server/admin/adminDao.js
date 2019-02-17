let knex = require('knex')(require('../common/properties').getDBProperties());

module.exports = {
    registerNewProduct: function(param) {
        let ret = knex('items').insert({
            item_nm_1: param.itemNm1,
            item_nm_2: param.itemNm2,
            price: param.price,
            item_kcd: param.itemKcd,
            origin_cd: param.originCd,
            image_path: param.imagePath,
            item_desc: param.itemDesc
        });
        return ret;
    },

    select: function(param) {
        let ret = knex('board_article')
            .join('users', 'users.user_no', 'board_article.fst_ins_usno')
            .select(
                'users.user_nm',
                knex.raw('FN_GET_RANK_NM(users.user_no, "2") as rank_nm'),
                knex.raw('FN_GET_DEPT_NM(users.user_no) as dept_nm'),
                'board_article.acti_no',
                'board_article.board_no',
                'board_article.subject',
                'board_article.content',
                'board_article.views');
        return ret;
    }
};
