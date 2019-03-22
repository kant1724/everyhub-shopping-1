function ajax(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
        async: false,
        xhrFields: { withCredentials: true },
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {
            if (gubun == 'selectProductOption') {
                selectProductOptionCallback(data.ret);
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {

    selectProductOption();
});

function selectProductOption() {
    let inputData = {};
    ajax(serverUrl + '/admin/product_manager/selectProductOption', inputData, 'selectProductOption', 'POST');
}

function selectProductOptionCallback(ret) {
    let html = '';
    for (let i = 0; i < ret.length; ++i) {
        html += '<tr><td class="text-center item-no">' + ret[i].itemNo +'</td>';
        html += '<td class="text-center"><img src = "' + ret[i].imagePath+ '" alt="" width="80px" style="border-radius: 5px;" class="img-fluid z-depth-0"></td>';
        html += '<td class="text-center">' + ret[i].itemNm1 + '</td>';
        html += '<td class="text-center">' + ret[i].itemNm2 + '</td>';
        html += '<td class="text-center">' + ret[i].recommendYn + '</td>';
        html += '<td class="text-center"><a id="item_option" class="common-button-1 item-option">등록</a></td>';
        html += '<td class="text-center"><a id="modify_product" class="common-button-1 modify-product">변경</a></td></tr>';
    }
    $('.item-table tbody').append(html);

    $('.modify-item').unbind();
    $('.modify-item').click(function() {
        let optionNo = $(this).parent().parent().find('.item-no').text();
    });

    $('.item-option').unbind();
    $('.item-option').click(function() {
    });
}
