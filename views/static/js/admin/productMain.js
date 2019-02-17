function ajax(url, input_data, gubun, method) {
    $.ajax(url, {
        type: method,
        data: input_data,
        async: false,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {
            if (gubun == 'selectProductList') {
                selectProductListCallback(data.ret);
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    $('.new-product-btn').click(function() {
       location.href = '/admin/productNew';
    });

    selectProductList();
});

function selectProductList() {
    let input = {};
    ajax('/admin/selectProductList', input, 'selectProductList', 'POST');
}

function selectProductListCallback(ret) {
    let html = '';
    for (let i = 0; i < ret.length; ++i) {
        html += '<tr><td class="text-center item-no">' + ret[i].item_no +'</td>';
        html += '<td class="text-center"><img src = "' + ret[i].image_path + '" alt="" width="80px" class="img-fluid z-depth-0"></td>';
        html += '<td class="text-center">' + ret[i].item_nm_1 + '</td>';
        html += '<td class="text-center">' + ret[i].item_nm_2 + '</td>';
        html += '<td class="text-center">' + ret[i].price + '</td>';
        html += '<td class="text-center"><button type="button" class="btn btn-sm btn-primary btn-rounded modify-product">변경</td></tr>';
    }
    $('.product-table tbody').append(html);

    $('.modify-product').click(function() {
        let itemNo = $($($(this).parent().parent()).find('.item-no')).text();
        location.href = '/admin/productModification?itemNo=' + itemNo
    });

}
