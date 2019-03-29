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
            } else if (gubun == 'updateInvoiceNo') {
                updateInvoiceNoCallback();
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    $('[data-toggle="datepicker"]').datepicker({
        format: 'yyyy-mm-dd',
        language: 'ko-KR',
        autoHide: true
    });
    let start = moment().subtract(1, 'months').format('YYYY-MM-DD');
    let end = moment().format('YYYY-MM-DD');
    $('#startingDate').val(start);
    $('#endingDate').val(end);

    $('#search').click(function() {
        selectOrderListMain();
    });
    $('#export_excel').click(function() {
        exportExcel();
    });
    $('#start_dlvr').click(function() {
        updateDlvrConfirmDate();
    });
    $('#save_invoice_no').click(function() {
        updateInvoiceNo();
    });

    selectOrderListMain();
});

function updateDlvrConfirmDate() {
    let orderObj = $('#order_list_tbody').find('.each-order');
    let orderListDetail = [];
    for (let i = 0; i < orderObj.length; ++i) {
        let orderList = {};
        let checked = $(orderObj[i]).find('.select-order').is(':checked');
        if (!checked) {
            continue;
        }
        orderList.orderNo = $(orderObj[i]).find('#order_no').text();
        orderList.orderSeq = $(orderObj[i]).find('#order_seq').val();
        orderList.itemNm1 = $(orderObj[i]).find('#item_nm_1').text();
        orderList.optionNm = $(orderObj[i]).find('#option_nm').text();
        orderList.orderTelno = $(orderObj[i]).find('#order_telno').text();
        orderListDetail.push(orderList);
    }
    if (orderListDetail.length == 0) {
        alert('배송시작할 주문을 선택하세요.');
        return;
    }
    if (confirm('선택된 주문내역의 배송을 시작하시겠습니까?')) {
        let inputData = {
            data: JSON.stringify(
                {
                    orderListDetail: orderListDetail
                })
        };
        ajax(serverUrl + '/admin/order_list/updateDlvrConfirmDate', inputData, 'updateDlvrConfirmDate', 'POST');
    }
}

function updateInvoiceNo() {
    let orderNo = $('#modal_order_no').val();
    let orderSeq = $('#modal_order_seq').val();
    let invoiceNo = $('#modal_invoice_no').val();
    let inputData = {
        orderNo: orderNo,
        orderSeq: orderSeq,
        invoiceNo: invoiceNo
    };
    ajax(serverUrl + '/admin/order_list/updateInvoiceNo', inputData, 'updateInvoiceNo', 'POST');
}

function updateInvoiceNoCallback() {
    alert('저장되었습니다.');
    $('#invoice_no_close_modal').click();
    selectOrderListMain();
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
        d['주문번호'] = allData[i].orderNo;
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
        let orderSeq = ret[i].orderSeq;
        let orderDate = ret[i].orderDate;
        if (orderDate == today) {
            orderDate = '<span class="today-icon">오늘</span>' + orderDate;
        }
        let orderPersonNm = ret[i].orderPersonNm;
        let orderTelno = ret[i].orderTelno;
        let itemNm1 = ret[i].itemNm1;
        let optionNm = ret[i].optionNm;
        let invoiceNo = ret[i].invoiceNo ? ret[i].invoiceNo : '';
        let totalPrice = ret[i].totalPrice;
        let depositConfirmDate = ret[i].depositConfirmDate;
        let dlvrConfirmDate = ret[i].dlvrConfirmDate;

        if (depositConfirmDate == null || depositConfirmDate == '') {
            depositConfirmDate = '<a class="confirm-deposit-btn common-button-1">입금확인</a>';
        }
        let hasInvoiceNo = false;
        if (invoiceNo == null || invoiceNo == '') {
            invoiceNo = '<a class="write-invoice-no-btn common-button-1">입력</a>';
        } else {
            hasInvoiceNo = true;
            invoiceNo = '<div>' + invoiceNo + '</div><a class="write-invoice-no-btn" style="text-decoration: underline; color: gray; font-size: 12px;">변경</a>';
        }

        if(dlvrConfirmDate == null || dlvrConfirmDate == '') {
            dlvrConfirmDate = '';
        }

        let pt = '15px';
        if (orderNo != prevOrderNo) {
            let rs = rowspan[orderNo];
            html += '<tr class="each-order" style="margin-bottom: 0px;">';
            html += '<input type="hidden" id="order_seq" value="' + orderSeq + '">';
            html += '<td style="vertical-align: middle; padding-top: ' + pt + ';">';
            if (!dlvrConfirmDate) {
                html += '<div class="ml-2 custom-control custom-checkbox">';
                if (!hasInvoiceNo) {
                    html += '<input type="checkbox" class="custom-control-input select-order" id="select_order' + orderNo + '_' + orderSeq + '" disabled>';
                } else {
                    html += '<input type="checkbox" class="custom-control-input select-order" id="select_order' + orderNo + '_' + orderSeq + '" checked>';
                }
                html += '<label class="custom-control-label" for="select_order' + orderNo + '_' + orderSeq + '"></label>';
                html += '</div>';
            }
            html += '</td>';
            html += '<td style="vertical-align: middle; padding-top: ' + pt + ';">';
            html += '<div id="order_no" class="order-no">' + orderNo + '</div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="width: 150px; vertical-align: middle; padding-top: ' + pt + ';">';
            html += '<div id="order_date" class="oreder-date">' + orderDate + '</div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="order_person_nm" class="order-person-nm">' + orderPersonNm + '</div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="order_telno" class="order-telno">' + orderTelno + '</div>';
            html += '</td>';
            html += '<td style="vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="item_nm_1" class="item-nm-1">' + itemNm1 + '</div>';
            html += '</td>';
            html += '<td style="vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="option_nm" class="option-nm">' + optionNm + '</div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="total_price" class="total-price">' + numberWithCommas(totalPrice) + '</div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="width: 150px; vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="deposit_confirm_date" class="deposit-confirm-date">' + depositConfirmDate + '</div>';
            html += '</td>';
            html += '<td style="width: 120px; vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="invoice_no" class="invoice-no">' + invoiceNo + '</div>';
            html += '</td>';
            html += '<td style="width: 120px; vertical-align: middle; padding-top: ' + pt + ';">';
            html += '<div id="dlvr_confirm_date" class="dlvr-confirm-date">' + dlvrConfirmDate + '</div>';
            html += '</td>';
            html += '</tr>';
        } else {
            html += '<tr class="each-order">';
            html += '<td style="vertical-align: middle; padding-top: ' + pt + ';">';
            if (!dlvrConfirmDate) {
                html += '<div class="ml-2 custom-control custom-checkbox">';
                if (!hasInvoiceNo) {
                    html += '<input type="checkbox" class="custom-control-input select-order" id="select_order' + orderNo + '_' + orderSeq + '" disabled>';
                } else {
                    html += '<input type="checkbox" class="custom-control-input select-order" id="select_order' + orderNo + '_' + orderSeq + '" checked>';
                }
                html += '<label class="custom-control-label" for="select_order' + orderNo + '_' + orderSeq + '"></label>';
                html += '</div>';
            }
            html += '</td>';
            html += '<td style="vertical-align: middle; padding-top: ' + pt + ';">';
            html += '<div id="order_no" class="order-no">' + orderNo + '</div>';
            html += '</td>';
            html += '<input type="hidden" id="order_seq" value="' + orderSeq + '">';
            html += '<td style="vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="item_nm_1" class="item-nm-1">' + itemNm1 + '</div>';
            html += '</td>';
            html += '<td style="vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="option_nm" class="option-nm">' + optionNm + '</div>';
            html += '</td>';
            html += '<td style="vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="invoice_no" class="invoice-no">' + invoiceNo + '</div>';
            html += '</td>';
            html += '<td style="vertical-align: middle; padding-top: ' + pt + ';">';
            html += '<div id="dlvr_confirm_date" class="dlvr-confirm-date">' + dlvrConfirmDate + '</div>';
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

    $('.write-invoice-no-btn').unbind();
    $('.write-invoice-no-btn').click(function() {
        let orderNo = $(this).parent().parent().parent().find('#order_no').text();
        let orderSeq = $(this).parent().parent().parent().find('#order_seq').val();
        $('#modal_invoice_no').val('');
        $('#modal_order_no').val(orderNo);
        $('#modal_order_seq').val(orderSeq);
        $('#invoice_no_modal').modal();
    });
}

function updateDepositConfirmDate(orderNo) {
    let inputData = {
        orderNo: orderNo
    };
    ajax(serverUrl + '/admin/order_list/updateDepositConfirmDate', inputData, 'updateDepositConfirmDate', 'POST');
}

function updateDepositConfirmDateCallback() {
    alert('입금확인 처리되었습니다.');
    selectOrderListMain();
}

function updateDlvrConfirmDateCallback() {
    alert('배송시작 처리되었습니다.');
    selectOrderListMain();
}
