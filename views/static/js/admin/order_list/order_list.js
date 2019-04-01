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
            } else if (gubun == 'insertInvoiceNo') {
                insertInvoiceNoCallback();
            } else if (gubun == 'selectInvoiceNo') {
                selectInvoiceNoCallback(data.ret);
            } else if (gubun == 'deleteInvoiceNo') {
                deleteInvoiceNoCallback();
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

    $('#check_all').click(function() {
        checkAll();
    });

    $('#save_invoice_no').click(function() {
        insertInvoiceNo();
    });

    selectOrderListMain();
});

function insertInvoiceNo() {
    let orderNo = $('#modal_order_no').val();
    let invoiceNo = $('#modal_invoice_no').val();
    let inputData = {
        orderNo: orderNo,
        invoiceNo: invoiceNo
    };
    ajax(serverUrl + '/admin/order_list/insertInvoiceNo', inputData, 'insertInvoiceNo', 'POST');
}

function insertInvoiceNoCallback() {
    alert('송장번호가 저장되었습니다.');
    selectInvoiceNo();
}

function selectInvoiceNo() {
    let orderNo = $('#modal_order_no').val();
    let inputData = {
        orderNo: orderNo
    };
    ajax(serverUrl + '/admin/order_list/selectInvoiceNo', inputData, 'selectInvoiceNo', 'POST');
}

function selectInvoiceNoCallback(ret) {
    $('#invoice_list_tbody').empty();
    let html = '';
    for (let i = 0; i < ret.length; ++i) {
        html += '<tr>';
        html += '<td>' + ret[i].orderNo + '</td>';
        html += '<td class="modal-invoice-no">' + ret[i].invoiceNo + '</td>';
        html += '<td><span class="delete-invoice-no text-underline-link">삭제</span></td>';
    }
    $('#invoice_list_tbody').append(html);

    $('.delete-invoice-no').unbind();
    $('.delete-invoice-no').click(function() {
        if (confirm('해당 송장번호를 삭제하시겠습니까?')) {
            let invoiceNo = $(this).parent().parent().find('.modal-invoice-no').text();
            deleteInvoiceNo(invoiceNo);
        }
    });
}

function deleteInvoiceNo(invoiceNo) {
    let orderNo = $('#modal_order_no').val();
    let inputData = {
        orderNo: orderNo,
        invoiceNo: invoiceNo
    };
    ajax(serverUrl + '/admin/order_list/deleteInvoiceNo', inputData, 'deleteInvoiceNo', 'POST');
}

function deleteInvoiceNoCallback() {
    alert('송장번호가 삭제되었습니다.');
    selectInvoiceNo();
}

function checkAll() {
    if ($('#check_all').is(':checked')) {
        $('#order_list_tbody').find('.select-order').prop('checked', true);
    } else {
        $('#order_list_tbody').find('.select-order').prop('checked', false);
    }
}

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
        orderList.itemNm = $(orderObj[i]).find('#item_nm').text();
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
        d['물품명'] = allData[i].itemNm + ',' + allData[i].optionNm;
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
        let itemNm = ret[i].itemNm;
        let optionNm = ret[i].optionNm;
        let qty = ret[i].qty ? ret[i].qty : '';
        let totalPrice = ret[i].totalPrice;
        let depositConfirmDate = ret[i].depositConfirmDate;
        let dlvrConfirmDate = ret[i].dlvrConfirmDate;
        let sendPersonNm = ret[i].sendPersonNm;
        let sendTelno = ret[i].sendTelno;
        let sendZipNo = ret[i].sendZipNo;
        let sendAddressMain = ret[i].sendAddressMain;
        let sendAddressDetail = ret[i].sendAddressDetail;
        let receivePersonNm = ret[i].receivePersonNm;
        let receiveTelno = ret[i].receiveTelno;
        let receiveZipNo = ret[i].receiveZipNo;
        let receiveAddressMain = ret[i].receiveAddressMain;
        let receiveAddressDetail = ret[i].receiveAddressDetail;
        let orderRemarks = ret[i].orderRemarks;
        let depositPersonNm = ret[i].depositPersonNm;
        let depositRemarks = ret[i].depositRemarks;
        let cancelDate = ret[i].cancelDate ? ret[i].cancelDate : '';

        if (depositConfirmDate == null || depositConfirmDate == '') {
            depositPersonNm += '<br><span class="confirm-deposit-btn text-underline-link" style="font-size: 11px;">입금확인</span>';
        }

        let hasInvoiceNo = true;
        /**
        if (invoiceNo == null || invoiceNo == '') {
            invoiceNo = '<span class="write-invoice-no-btn text-underline-link">입력</span>';
        } else {
            hasInvoiceNo = true;
            invoiceNo = '<div>' + invoiceNo + '</div><a class="write-invoice-no-btn" style="text-decoration: underline; color: gray; font-size: 12px;">변경</a>';
        }
        **/
        if(dlvrConfirmDate == null || dlvrConfirmDate == '') {
            dlvrConfirmDate = '';
        }

        let pt = '15px';
        html += '<tr class="each-order" style="margin-bottom: 0px;">';
        html += '<input type="hidden" id="order_seq" class="order-seq" value="' + orderSeq + '">';
        html += '<input type="hidden" class="send-person-nm" value="' + sendPersonNm + '">';
        html += '<input type="hidden" class="send-telno" value="' + sendTelno + '">';
        html += '<input type="hidden" class="send-zip-no" value="' + sendZipNo + '">';
        html += '<input type="hidden" class="send-address-main" value="' + sendAddressMain + '">';
        html += '<input type="hidden" class="send-address-detail" value="' + sendAddressDetail + '">';
        html += '<input type="hidden" class="receive-person-nm" value="' + receivePersonNm + '">';
        html += '<input type="hidden" class="receive-telno" value="' + receiveTelno + '">';
        html += '<input type="hidden" class="receive-zip-no" value="' + receiveZipNo + '">';
        html += '<input type="hidden" class="receive-address-main" value="' + receiveAddressMain + '">';
        html += '<input type="hidden" class="receive-address-detail" value="' + receiveAddressDetail + '">';
        html += '<input type="hidden" class="order-remarks" value="' + orderRemarks + '">';
        html += '<input type="hidden" class="deposit-remarks" value="' + depositRemarks + '">';
        if (orderNo != prevOrderNo) {
            let rs = rowspan[orderNo];
            html += '<td style="vertical-align: middle; padding-top: ' + pt + ';">';
            if (!dlvrConfirmDate) {
                html += '<div class="ml-2 custom-control custom-checkbox">';
                if (!hasInvoiceNo) {
                    html += '<input type="checkbox" class="custom-control-input select-order" id="select_order' + orderNo + '_' + orderSeq + '" disabled>';
                } else {
                    html += '<input type="checkbox" class="custom-control-input select-order" id="select_order' + orderNo + '_' + orderSeq + '">';
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
            html += '<div id="order_detail" class="oreder-detail text-underline-link">상세정보</div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="order_person_nm" class="order-person-nm">' + orderPersonNm + '</div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="order_telno" class="order-telno">' + orderTelno + '</div>';
            html += '</td>';
            html += '<td style="vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="item_nm" class="item-nm">' + itemNm + '</div>';
            html += '</td>';
            html += '<td style="vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="option_nm" class="option-nm">' + optionNm + '</div>';
            html += '</td>';
            html += '<td style="vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="qty" class="qty">' + qty + '</div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="total_price" class="total-price">' + numberWithCommas(totalPrice) + '</div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="deposit_person_nm" class="deposit-person-nm">' + depositPersonNm + '</div>';
            html += '</td>';
            html += '<td style="vertical-align: middle; padding-top: ' + pt + ';">';
            html += '<div id="dlvr_confirm_date" class="dlvr-confirm-date">' + dlvrConfirmDate + '</div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + ';">';
            html += '<div id="cancel_date" class="cancel-date">' + cancelDate + '</div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + ';">';
            html += '<div id="write_invoice" class="write-invoice"><span class="text-underline-link">입력</span></div>';
            html += '</td>';
            html += '</tr>';
        } else {
            html += '<td style="vertical-align: middle; padding-top: ' + pt + ';">';
            if (!dlvrConfirmDate) {
                html += '<div class="ml-2 custom-control custom-checkbox">';
                if (!hasInvoiceNo) {
                    html += '<input type="checkbox" class="custom-control-input select-order" id="select_order' + orderNo + '_' + orderSeq + '" disabled>';
                } else {
                    html += '<input type="checkbox" class="custom-control-input select-order" id="select_order' + orderNo + '_' + orderSeq + '">';
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
            html += '<div id="item_nm" class="item-nm">' + itemNm + '</div>';
            html += '</td>';
            html += '<td style="vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="option_nm" class="option-nm">' + optionNm + '</div>';
            html += '</td>';
            html += '<td style="vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="qty" class="qty">' + qty + '</div>';
            html += '</td>';
            html += '<td style="vertical-align: middle; padding-top: ' + pt + ';">';
            html += '<div id="dlvr_confirm_date" class="dlvr-confirm-date">' + dlvrConfirmDate + '</div>';
            html += '</td>';
            html += '</tr>';
        }
        prevOrderNo = orderNo;
    }
    $('#order_list_tbody').append(html);

    $('.oreder-detail').unbind();
    $('.oreder-detail').click(function() {
        let orderNo = $(this).parent().parent().find('#order_no').text();
        let sendPersonNm = $(this).parent().parent().find('.send-person-nm').val();
        let sendTelno = $(this).parent().parent().find('.send-telno').val();
        let sendZipNo = $(this).parent().parent().find('.send-zip-no').val();
        let sendAddressMain = $(this).parent().parent().find('.send-address-main').val();
        let sendAddressDetail = $(this).parent().parent().find('.send-address-detail').val();
        let receivePersonNm = $(this).parent().parent().find('.receive-person-nm').val();
        let receiveTelno = $(this).parent().parent().find('.receive-telno').val();
        let receiveZipNo = $(this).parent().parent().find('.receive-zip-no').val();
        let receiveAddressMain = $(this).parent().parent().find('.receive-address-main').val();
        let receiveAddressDetail = $(this).parent().parent().find('.receive-address-detail').val();
        let orderRemarks = $(this).parent().parent().find('.order-remarks').val();
        let depositRemarks = $(this).parent().parent().find('.deposit-remarks').val();

        $('#modal_send_person_nm').text(sendPersonNm);
        $('#modal_send_telno').text(sendTelno);
        $('#modal_send_zip_no').text(sendZipNo);
        $('#modal_send_address_main').text(sendAddressMain);
        $('#modal_send_address_detail').text(sendAddressDetail);
        $('#modal_receive_person_nm').text(receivePersonNm);
        $('#modal_receive_telno').text(receiveTelno);
        $('#modal_receive_zip_no').text(receiveZipNo);
        $('#modal_receive_address_main').text(receiveAddressMain);
        $('#modal_receive_address_detail').text(receiveAddressDetail);
        $('#modal_order_remarks').text(orderRemarks);
        $('#modal_deposit_remarks').text(depositRemarks);

        $('#order_detail_modal').modal();
    });
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

    $('.write-invoice').unbind();
    $('.write-invoice').click(function() {
        let orderNo = $(this).parent().parent().parent().find('#order_no').text();
        $('#modal_order_no').val(orderNo);
        $('#invoice_no_modal').modal();
        selectInvoiceNo();
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
