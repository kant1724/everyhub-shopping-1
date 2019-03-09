function ajax(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
        async: false,
        xhrFields: { withCredentials: true },
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {
            if (gubun == 'selectOrderListMain') {
                selectOrderListMainCallback(data.ret);
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    constructMyOrder.init(selectOrderListMain);

    selectOrderListMain();
});

function selectOrderListMain() {
    let inputData = {
        lastOrderNo: constructMyOrder.lastOrderNo,
        limit: constructMyOrder.idPerPage * constructMyOrder.pageLength
    };
    ajax(serverUrl + '/admin/order_list/selectOrderListMain', inputData, 'selectOrderListMain', 'POST');
}

function selectOrderListMainCallback(ret) {
    constructMyOrder.selectCallback(ret);
}

