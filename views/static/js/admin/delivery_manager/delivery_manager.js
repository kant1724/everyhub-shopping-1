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
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    constructShippingInfo.init(selectShippingInfoList);

    selectShippingInfoList();
});

function selectShippingInfoList() {
    let inputData = {
        lastShippingInfoNo: constructShippingInfo.lastShippingInfoNo,
        limit: constructShippingInfo.idPerPage * constructShippingInfo.pageLength
    };

    ajax(serverUrl + '/admin/delivery_manager/selectShippingInfoList', inputData, 'selectShippingInfoList', 'POST');
}

function selectShippingInfoListCallback(ret) {
    constructShippingInfo.selectCallback(ret)
}
