function ajax(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
        async: false,
        xhrFields: { withCredentials: true },
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {
            if (gubun == 'selectShippingInfoList') {
                selectShippingInfoListCallback(data.ret);
            } else if (gubun == 'insertShippingInfo') {
                insertShippingInfoCallback();
            } else if (gubun == 'updateShippingInfo') {
                updateShippingInfoCallback();
            } else if (gubun == 'deleteShippingInfo') {
                deleteShippingInfoCallback();
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    $('.new-shipping-info-btn').click(function() {
        $('#modal_shipping_info_no').val('');
        $('#shipping_info_modal').modal();
    });

    $('#save_shipping_info').click(function() {
        if (isNull($('#modal_shipping_info_no').val())) {
            insertShippingInfo();
        } else {
            updateShippingInfo();
        }
    });

    constructShippingInfo.init(selectShippingInfoList, deleteShippingInfo);

    selectShippingInfoList();
});

function insertShippingInfo() {
    let inputData = {
        addr1: $('#modal_addr_1').val(),
        addr2: $('#modal_addr_2').val(),
        addr3: $('#modal_addr_3').val(),
        zipNo: $('#modal_zip_no').val(),
        shippingFee: $('#modal_shipping_fee').val(),
        exceptKeyword: $('#modal_except_keyword').val()
    };

    ajax(serverUrl + '/admin/delivery_manager/insertShippingInfo', inputData, 'insertShippingInfo', 'POST');
}

function insertShippingInfoCallback() {
    alert('배송정보가 등록되었습니다.');
    constructShippingInfo.init(selectShippingInfoList, deleteShippingInfo);
    selectShippingInfoList();
    $('#shipping_info_close_modal').click();
}

function updateShippingInfo() {
    let inputData = {
        shippingInfoNo: $('#modal_shipping_info_no').val(),
        addr1: $('#modal_addr_1').val(),
        addr2: $('#modal_addr_2').val(),
        addr3: $('#modal_addr_3').val(),
        zipNo: $('#modal_zip_no').val(),
        shippingFee: $('#modal_shipping_fee').val(),
        exceptKeyword: $('#modal_except_keyword').val()
    };

    ajax(serverUrl + '/admin/delivery_manager/updateShippingInfo', inputData, 'updateShippingInfo', 'POST');
}

function updateShippingInfoCallback() {
    alert('배송정보가 변경되었습니다.');
    constructShippingInfo.init(selectShippingInfoList, deleteShippingInfo);
    selectShippingInfoList();
    $('#shipping_info_close_modal').click();
}

function deleteShippingInfo(shippingInfoNo) {
    let inputData = {
        shippingInfoNo: shippingInfoNo
    };

    ajax(serverUrl + '/admin/delivery_manager/deleteShippingInfo', inputData, 'deleteShippingInfo', 'POST');
}

function deleteShippingInfoCallback() {
    alert('배송정보가 삭제되었습니다.');
}

function selectShippingInfoList() {
    let inputData = {
        lastShippingInfoNo: constructShippingInfo.lastShippingInfoNo,
        limit: constructShippingInfo.idPerPage * constructShippingInfo.pageLength
    };
    ajax(serverUrl + '/admin/delivery_manager/selectShippingInfoList', inputData, 'selectShippingInfoList', 'POST');
}

function selectShippingInfoListCallback(ret) {
    constructShippingInfo.selectCallback(ret);
}
