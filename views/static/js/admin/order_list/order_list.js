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
    $('#search').click(function() {
        selectOrderListMain();
    });
    datepicker.init();
    selectOrderListMain();
});

function selectOrderListMain() {
    let inputData = {
        startOrderDate: $('#startingDate').val(),
        endOrderDate: $('#endingDate').val()
    };
    ajax(serverUrl + '/admin/order_list/selectOrderListMain', inputData, 'selectOrderListMain', 'POST');
}

function selectOrderListMainCallback(ret) {
    let html = '';
    $('#order_list_tbody').empty();
    let rowspan = {};
    for (let i = 0; i < ret.length; ++i) {
        let key = ret[i].orderNo;
        if (rowspan[key] != null) {
            rowspan[key] += 1
        } else {
            rowspan[key] = 1;
        }
    }
    let prevOrderNo = -1;
    for (let i = 0; i < ret.length; ++i) {
        let orderNo = ret[i].orderNo;
        let orderDate = ret[i].orderDate;
        let orderPersonNm = ret[i].orderPersonNm;
        let orderTelno = ret[i].orderTelno;
        let itemNm1 = ret[i].itemNm1;
        let qty = ret[i].qty;
        if (orderNo != prevOrderNo) {
            let rs = rowspan[orderNo];
            html += '<tr style="margin-bottom: 0px;">';
            let pt = '15px';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + ';">';
            html += '<div id="order_no" class="order-no">' + orderNo + '</div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + ';">';
            html += '<div id="order_date" class="oreder-date">' + orderDate + '</div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="order_person_nm" class="order-person-nm">' + orderPersonNm + '</div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="order_telno" class="order-telno">' + orderTelno + '</div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="deposit_yn" class="deposit-yn"><a class="common-button-1">입금확인</a></div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="dlvr_yn" class="dlvr-yn"><a class="common-button-1">배송완료</a></div>';
            html += '</td>';
            html += '<td>';
            html += '<div id="item_nm_1" class="item-nm-1">' + itemNm1 + '</div>';
            html += '</td>';
            html += '<td>';
            html += '<div id="qty" class="qty">' + qty + '</div>';
            html += '</td>';
            html += '</tr>';
        } else {
            html += '<tr>';
            html += '<td>';
            html += '<div id="item_nm_1" class="item-nm-1">' + itemNm1 + '</div>';
            html += '</td>';
            html += '<td>';
            html += '<div id="qty" class="qty">' + qty + '</div>';
            html += '</td>';
            html += '</tr>';
        }
        prevOrderNo = orderNo;
    }
    $('#order_list_tbody').append(html);
}
