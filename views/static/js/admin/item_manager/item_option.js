function ajax(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
        async: false,
        xhrFields: { withCredentials: true },
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {
            if (gubun == 'selectItemOption') {
                selectItemOptionCallback(data.ret);
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    selectItemOption();
});

function selectItemOption() {
    let itemNo = $('#item_no').val();
    let inputData = {
        itemNo: itemNo
    };
    ajax(serverUrl + '/admin/item_manager/selectItemOption', inputData, 'selectItemOption', 'POST');
}

function selectItemOptionCallback(ret) {
    let html = '';
    for (let i = 0; i < ret.length; ++i) {
        html += '<tr><td class="text-center item-no">' + ret[i].optionNo +'</td>';
        html += '<td class="text-center">' + ret[i].optionNm + '</td>';
        html += '<td class="text-center">' + ret[i].itemPrice + '</td>';
        html += '<td class="text-center">' + ret[i].shippingFee + '</td>';
        html += '<td class="text-center"><a id="modify_option" class="common-button-1 item-option">변경</a></td>';
        html += '<td class="text-center"><a id="delete_option" class="common-button-1 modify-product">삭제</a></td></tr>';
    }
    $('.option-table tbody').append(html);

    $('.modify-option').unbind();
    $('.modify-option').click(function() {
        let optionNo = $(this).parent().parent().find('.item-no').text();
    });

}
