function ajax(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
        async: false,
        xhrFields: { withCredentials: true },
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {
            if (gubun == 'selectItemList') {
                selectItemListCallback(data.ret);
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    $('.new-item-btn').click(function() {
       location.href = '/admin/item_manager/item_new';
    });

    selectItemList();
});

function selectItemList() {
    let inputData = {};
    ajax(serverUrl + '/admin/item_manager/selectItemList', inputData, 'selectItemList', 'POST');
}

function selectItemListCallback(ret) {
    let html = '';
    for (let i = 0; i < ret.length; ++i) {
        html += '<tr><td class="text-center item-no">' + ret[i].itemNo +'</td>';
        html += '<td class="text-center"><img src = "' + ret[i].imagePath+ '" alt="" width="80px" style="border-radius: 5px;" class="img-fluid z-depth-0"></td>';
        html += '<td class="text-center">' + ret[i].itemNm1 + '</td>';
        html += '<td class="text-center">' + ret[i].itemNm2 + '</td>';
        html += '<td class="text-center">' + ret[i].recommendYn + '</td>';
        html += '<td class="text-center"><a id="item_option" class="common-button-1 item-option">등록</a></td>';
        html += '<td class="text-center"><a id="modify_item" class="common-button-1 modify-item">변경</a></td></tr>';
    }
    $('.item-table tbody').append(html);

    $('td').css('vertical-align', 'middle');

    $('.modify-item').unbind();
    $('.modify-item').click(function() {
        let itemNo = $(this).parent().parent().find('.item-no').text();
        location.href = '/admin/item_manager/item_modify?itemNo=' + itemNo;
    });

    $('.item-option').unbind();
    $('.item-option').click(function() {
        let itemNo = $(this).parent().parent().find('.item-no').text();
        location.href = '/admin/item_manager/item_option?itemNo=' + itemNo;
    });
}
