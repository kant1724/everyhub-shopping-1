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
            } else if (gubun == 'updateDepositConfirmDate') {
                updateDepositConfirmDateCallback();
            } else if (gubun == 'updateDlvrConfirmDate') {
                updateDlvrConfirmDateCallback();
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    $('#search').click(function() {
        selectOrderListMain();
    });
    $('#export_excel').click(function() {
        exportExcel();
    });
    $('#update_invoice_no').click(function() {
        updateInvoiceNo();
    });

    datepicker.init();
    selectOrderListMain();
});

function updateInvoiceNo() {

}

function exportExcel() {
    let wb = XLSX.utils.book_new();
    let header = {
        header: ['보내는분',
            '보내는분 전화',
            '보내는분 주소',
            '보내는분 상세주소',
            '받는분',
            '받는분 전화',
            '받는분 주소',
            '받는분 상세주소',
            '물품명',
            '박스수량',
            '송장번호'
        ]
    };
    let data = [];
    for (let i = 0; i < allData.length; ++i) {
        let d = {};
        d['보내는분'] = allData[i].sendPersonNm;
        d['보내는분 전화'] = allData[i].sendTelno;
        d['보내는분 주소'] = allData[i].sendAddressMain;
        d['보내는분 상세주소'] = allData[i].sendAddressDetail;
        d['받는분'] = allData[i].receivePersonNm;
        d['받는분 전화'] = allData[i].receiveTelno;
        d['받는분 주소'] = allData[i].receiveAddressMain;
        d['받는분 상세주소'] = allData[i].receiveAddressDetail;
        d['물품명'] = allData[i].itemNm1;
        d['박스수량'] = allData[i].qty;
        d['송장번호'] = '';
        data.push(d);
    }
    let ws = XLSX.utils.json_to_sheet(data, header);
    XLSX.utils.book_append_sheet(wb, ws, '주문내역');
    XLSX.writeFile(wb, "order_list.xlsx");
}

function selectOrderListMain() {
    let inputData = {
        startOrderDate: $('#startingDate').val(),
        endOrderDate: $('#endingDate').val()
    };
    ajax(serverUrl + '/admin/order_list/selectOrderListMain', inputData, 'selectOrderListMain', 'POST');
}

let allData = [];
function selectOrderListMainCallback(ret) {
    allData = ret;
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
        let today = moment().format('YYYY-MM-DD');
        let orderNo = ret[i].orderNo;
        let orderDate = ret[i].orderDate;
        if (orderDate == today) {
            orderDate = '<span class="today-icon">오늘</span>' + orderDate;
        }
        let orderPersonNm = ret[i].orderPersonNm;
        let orderTelno = ret[i].orderTelno;
        let itemNm1 = ret[i].itemNm1;
        let qty = ret[i].qty;
        let totalPrice = ret[i].totalPrice;
        let depositConfirmDate = ret[i].depositConfirmDate;
        let dlvrConfirmDate = ret[i].dlvrConfirmDate;
        let invoiceNo = ret[i].invoiceNo ? ret[i].invoiceNo : '';

        if (depositConfirmDate == null || depositConfirmDate == '') {
            depositConfirmDate = '<a class="confirm-deposit-btn common-button-1">입금확인</a>';
        }
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
            html += '<td>';
            html += '<div id="item_nm_1" class="item-nm-1">' + itemNm1 + '</div>';
            html += '</td>';
            html += '<td>';
            html += '<div id="qty" class="qty">' + qty + '</div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="total_price" class="total-price">' + numberWithCommas(totalPrice) + '</div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="deposit_confirm_date" class="deposit-confirm-date">' + depositConfirmDate + '</div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="invoice_no" class="invoice-no">' + invoiceNo + '</div>';
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

    $('.confirm-deposit-btn').unbind();
    $('.confirm-deposit-btn').click(function() {
        let orderNo = $(this).parent().parent().parent().find('#order_no').text();
        updateDepositConfirmDate(orderNo);
    });
    $('.confirm-dlvr-btn').unbind();
    $('.confirm-dlvr-btn').click(function() {
        let orderNo = $(this).parent().parent().parent().find('#order_no').text();
        updateDlvrConfirmDate(orderNo);
    });
}

function updateDepositConfirmDate(orderNo) {
    let inputData = {
        orderNo: orderNo
    };
    ajax(serverUrl + '/admin/order_list/updateDepositConfirmDate', inputData, 'updateDepositConfirmDate', 'POST');
}

function updateDlvrConfirmDate(orderNo) {
    let inputData = {
        orderNo: orderNo
    };
    ajax(serverUrl + '/admin/order_list/updateDlvrConfirmDate', inputData, 'updateDlvrConfirmDate', 'POST');
}

function updateDepositConfirmDateCallback() {
    alert('입금확인 처리되었습니다.');
    selectOrderListMain();
}

function updateDlvrConfirmDateCallback() {
    alert('배송완료 처리되었습니다.');
    selectOrderListMain();
}