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
            } else if (gubun == 'insertItemOption') {
                insertItemOptionCallback();
            } else if (gubun == 'updateItemOption') {
                updateItemOptionCallback();
            } else if (gubun == 'deleteItemOption') {
                deleteItemOptionCallback();
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    $('.new-option-btn').click(function() {
        $('#option_no').val('');
        $('#option_nm').val('');
        $('#item_price').val('');
        $('#shipping_fee').val('');
        $('#option_modal').modal();
    });

    $('#save_option').click(function() {
        if ($('#option_no').val() == '') {
            insertItemOption();
        } else {
            updateItemOption();
        }
    });

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
    $('.option-table tbody').empty();
    for (let i = 0; i < ret.length; ++i) {
        html += '<tr><td class="text-center option-no">' + ret[i].optionNo +'</td>';
        html += '<td class="text-center option-nm">' + ret[i].optionNm + '</td>';
        html += '<td class="text-center item-price">' + ret[i].itemPrice + '</td>';
        html += '<td class="text-center shipping-fee">' + ret[i].shippingFee + '</td>';
        html += '<td class="text-center" style="width: 100px;"><a id="modify_option" class="common-button-1 modify-option">변경</a></td>';
        html += '<td class="text-center" style="width: 100px;"><a id="delete_option" class="common-button-1 delete-option">삭제</a></td></tr>';
    }
    $('.option-table tbody').append(html);

    $('.modify-option').unbind();
    $('.modify-option').click(function() {
        let optionNo = $(this).parent().parent().find('.option-no').text();
        let optionNm = $(this).parent().parent().find('.option-nm').text();
        let itemPrice = $(this).parent().parent().find('.item-price').text();
        let shippingFee = $(this).parent().parent().find('.shipping-fee').text();

        $('#option_no').val(optionNo);
        $('#option_nm').val(optionNm);
        $('#item_price').val(itemPrice);
        $('#shipping_fee').val(shippingFee);
        $('#option_modal').modal();
    });

    $('.delete-option').unbind();
    $('.delete-option').click(function() {
        let optionNo = $(this).parent().parent().find('.option-no').text();
        if (confirm('해당 옵션을 삭제하시겠습니까?')) {
            deleteItemOption(optionNo);
        }
    });
}

function insertItemOption() {
    let itemNo = $('#item_no').val();
    let optionNm = $('#option_nm').val();
    let itemPrice = $('#item_price').val() ? $('#item_price').val() : 0;
    let shippingFee = $('#shipping_fee').val() ? $('#shipping_fee').val() : 0;

    let inputData = {
        itemNo: itemNo,
        optionNm: optionNm,
        itemPrice: itemPrice,
        shippingFee, shippingFee
    };
    ajax(serverUrl + '/admin/item_manager/insertItemOption', inputData, 'insertItemOption', 'POST');
}

function insertItemOptionCallback() {
    alert('정상적으로 저장되었습니다.');
    selectItemOption();
    $('#option_close_modal').click();
}

function updateItemOption() {
    let optionNo = $('#option_no').val();
    let itemNo = $('#item_no').val();
    let optionNm = $('#option_nm').val();
    let itemPrice = $('#item_price').val() ? $('#item_price').val() : 0;
    let shippingFee = $('#shipping_fee').val() ? $('#shipping_fee').val() : 0;

    let inputData = {
        optionNo: optionNo,
        itemNo: itemNo,
        optionNm: optionNm,
        itemPrice: itemPrice,
        shippingFee, shippingFee
    };
    ajax(serverUrl + '/admin/item_manager/updateItemOption', inputData, 'updateItemOption', 'POST');
}

function updateItemOptionCallback() {
    alert('정상적으로 저장되었습니다.');
    selectItemOption();
    $('#option_close_modal').click();
}

function deleteItemOption(optionNo) {
    let itemNo = $('#item_no').val();
    let inputData = {
        optionNo: optionNo,
        itemNo: itemNo
    };
    ajax(serverUrl + '/admin/item_manager/deleteItemOption', inputData, 'deleteItemOption', 'POST');
}

function deleteItemOptionCallback() {
    alert('정상적으로 삭제되었습니다.');
    selectItemOption();
}
