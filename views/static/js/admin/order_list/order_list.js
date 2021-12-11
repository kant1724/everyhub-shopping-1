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
            } else if (gubun == 'updateAdditionalInfo') {
                updateAdditionalInfoCallback();
            } else if (gubun == 'cancelOrder') {
                cancelOrderCallback();
            } else if (gubun == 'sendSMS') {
                sendSMSCallback();
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
    let start = moment().format('YYYY-MM-DD');
    let end = moment().format('YYYY-MM-DD');
    $('#starting_date').val(start);
    $('#ending_date').val(end);

    $('#search').click(function() {
        selectOrderListMain();
    });

    $('#export_excel_cj').click(function() {
        exportExcelCj();
    });

    $('#export_excel_hanjin').click(function() {
        exportExcelHanjin();
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

    $('#save_additional_info').click(function() {
        updateAdditionalInfo();
    });

    $('#send_sms').click(function() {
        sendSMS();
    });

    $('#user_nm').keydown(function(key) {
        if (key.keyCode == 13) {
            selectOrderListMain();
        }
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
    ajax('/admin/order_list/insertInvoiceNo', inputData, 'insertInvoiceNo', 'POST');
}

function insertInvoiceNoCallback() {
    alert('송장번호가 저장되었습니다.');
    selectInvoiceNo();
}

function updateAdditionalInfo() {
    let orderNo = $('#modal_order_no_2').val();
    let basicFares = $('#modal_basic_fares').val();
    let boxType = $('#modal_box_type').val();
    let fareType = $('#modal_fare_type').val();
    let inputData = {
        orderNo: orderNo,
        basicFares: basicFares,
        boxType: boxType,
        fareType: fareType
    };
    ajax('/admin/order_list/updateAdditionalInfo', inputData, 'updateAdditionalInfo', 'POST');
}

function updateAdditionalInfoCallback() {
    alert('기타정보가 저장되었습니다.');
    selectOrderListMain();
}

function selectInvoiceNo() {
    let orderNo = $('#modal_order_no').val();
    let inputData = {
        orderNo: orderNo
    };
    ajax('/admin/order_list/selectInvoiceNo', inputData, 'selectInvoiceNo', 'POST');
}

function selectInvoiceNoCallback(ret) {
    $('#invoice_list_tbody').empty();
    let html = '';
    for (let i = 0; i < ret.length; ++i) {
        html += '<tr>';
        html += '<td>' + ret[i].orderNo + '</td>';
        html += '<td class="modal-invoice-no">' + ret[i].invoiceNo + '</td>';
        html += '<td class="modal-invoice-detail text-underline-link">조회</td>';
        html += '<td><span class="delete-invoice-no text-underline-link">삭제</span></td>';
        html += '</tr>';
    }
    $('#invoice_list_tbody').append(html);

    $('.delete-invoice-no').unbind();
    $('.delete-invoice-no').click(function() {
        if (confirm('해당 송장번호를 삭제하시겠습니까?')) {
            let invoiceNo = $(this).parent().parent().find('.modal-invoice-no').text();
            deleteInvoiceNo(invoiceNo);
        }
    });

    $('.modal-invoice-detail').unbind();
    $('.modal-invoice-detail').click(function() {
        let invoiceNo = $(this).parent().find('.modal-invoice-no').text();
        window.open('http://https://search.naver.com/search.naver?where=nexearch&sm=top_hty&fbm=0&ie=utf8&query=' + invoiceNo);
        //window.open('https://www.doortodoor.co.kr/parcel/doortodoor.do?fsp_action=PARC_ACT_002&fsp_cmd=retrieveInvNoACT&invc_no=' + invoiceNo);
    });
}

function deleteInvoiceNo(invoiceNo) {
    let orderNo = $('#modal_order_no').val();
    let inputData = {
        orderNo: orderNo,
        invoiceNo: invoiceNo
    };
    ajax('/admin/order_list/deleteInvoiceNo', inputData, 'deleteInvoiceNo', 'POST');
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
        ajax('/admin/order_list/updateDlvrConfirmDate', inputData, 'updateDlvrConfirmDate', 'POST');
    }
}

function exportExcelCj() {
    let wb = XLSX.utils.book_new();
    let header = {
        header: ['보내는성명',
            '보내는분전화번호',
            '보내는분기타연락처',
            '보내는분주소(전체, 분할)',
            '받는분성명',
            '받는분전화번호',
            '받는분기타연락처',
            '받는분주소(전체, 분할)',
            '기본운임',
            '박스타입',
            '운임구분',
            '품목명',
            '박스수량',
            '배송메세지1'
        ]
    };
    let data = [];
    let orderObj = $('#order_list_tbody').find('.each-order');
    for (let i = 0; i < allData.length; ++i) {
        if (!isNull(allData[i].cancelDate))  {
            continue;
        }
        let idx = 0;
        for (let j = 0; j < orderObj.length; ++j) {
            let orderNo = $(orderObj[j]).find('#order_no').text();
            if (allData[i].orderNo == orderNo) {
                idx = j;
                break;
            }
        }
        let checked = $(orderObj[idx]).find('.select-order').is(':checked');
        if (!checked) {
            continue;
        }
        let d = {};
        d['보내는성명'] = allData[i].sendPersonNm;
        d['보내는분전화번호'] = allData[i].sendTelno;
        d['보내는분기타연락처'] = allData[i].sendTelno;
        d['보내는분주소(전체, 분할)'] = allData[i].sendAddressMain + ' ' + allData[i].sendAddressDetail;
        if (d['보내는성명'] == '') {
            d['보내는성명'] = sellerInfo.sellerNm;
        }
        if (d['보내는분전화번호'] == '') {
            d['보내는분전화번호'] = sellerInfo.telno;
        }
        if (d['보내는분기타연락처'] == '') {
            d['보내는분기타연락처'] = sellerInfo.telno;
        }
        if (d['보내는분주소(전체, 분할)'] == ' ') {
            d['보내는분주소(전체, 분할)'] = sellerInfo.sendAddress;
        }
        d['받는분성명'] = allData[i].receivePersonNm;
        d['받는분전화번호'] = allData[i].receiveTelno;
        d['받는분기타연락처'] = allData[i].receiveTelno;
        d['받는분주소(전체, 분할)'] = allData[i].receiveAddressMain + ' ' + allData[i].receiveAddressDetail;
        d['기본운임'] = allData[i].basicFares;
        d['박스타입'] = allData[i].boxType;
        d['운임구분'] = allData[i].fareType;
        d['품목명'] = allData[i].itemNm + ',' + allData[i].optionNm;
        d['박스수량'] = allData[i].qty;
        d['배송메세지1'] = '';
        data.push(d);
    }
    if (data.length == 0) {
        alert('체크박스로 엑셀다운할 리스트를 선택해 주세요.');
        return;
    }
    let ws = XLSX.utils.json_to_sheet(data, header);
    XLSX.utils.book_append_sheet(wb, ws, '주문내역');
    XLSX.writeFile(wb, "order_list.xlsx");
}

function exportExcelHanjin() {
    let wb = XLSX.utils.book_new();
    let header = {
        header: ['보내는분',
            '보내는분 연락처',
            '보내는 담당자',
            '보내는분전화번호',
            '보내는분우편번호',
            '보내는분주소',
            '받는분성함',
            '받는분 연락처',
            '받는분 담당자',
            '받는분 핸드폰',
            '받는분 우편번호',
            '받는분주소',
            '수량',
            '품목명',
            '운임type',
            '지불조건',
            '출고번호',
            '특기사항',
        ]
    };
    let data = [];
    let orderObj = $('#order_list_tbody').find('.each-order');
    for (let i = 0; i < allData.length; ++i) {
        if (!isNull(allData[i].cancelDate))  {
            continue;
        }
        let idx = 0;
        for (let j = 0; j < orderObj.length; ++j) {
            let orderNo = $(orderObj[j]).find('#order_no').text();
            if (allData[i].orderNo == orderNo) {
                idx = j;
                break;
            }
        }
        let checked = $(orderObj[idx]).find('.select-order').is(':checked');
        if (!checked) {
            continue;
        }
        let d = {};
        d['보내는분'] = allData[i].sendPersonNm;
        d['보내는분 연락처'] = allData[i].sendTelno;
        d['보내는분전화번호'] = allData[i].sendTelno;
        d['보내는분우편번호'] = allData[i].sendZipNo;
        d['보내는분주소'] = allData[i].sendAddressMain + ' ' + allData[i].sendAddressDetail;
        if (d['보내는분'] == '') {
            d['보내는분'] = sellerInfo.sellerNm;
        }
        if (d['보내는분 연락처'] == '') {
            d['보내는분 연락처'] = sellerInfo.telno;
        }
        if (d['보내는분전화번호'] == '') {
            d['보내는분전화번호'] = sellerInfo.telno;
        }
        if (d['보내는분우편번호'] == '') {
            d['보내는분우편번호'] = sellerInfo.sendZipNo;
        }
        if (d['보내는분주소'] == ' ') {
            d['보내는분주소'] = sellerInfo.sendAddress;
        }
        d['받는분성함'] = allData[i].receivePersonNm;
        d['받는분 연락처'] = allData[i].receiveTelno;
        d['받는분 핸드폰'] = allData[i].receiveTelno;
        d['받는분 우편번호'] = allData[i].receiveZipNo;
        d['받는분주소'] = allData[i].receiveAddressMain + ' ' + allData[i].receiveAddressDetail;
        d['수량'] = allData[i].qty;
        d['품목명'] = allData[i].itemNm + ',' + allData[i].optionNm;
        d['운임type'] = 'B';
        d['지불조건'] = '선불';
        data.push(d);
    }
    if (data.length == 0) {
        alert('체크박스로 엑셀다운할 리스트를 선택해 주세요.');
        return;
    }
    let ws = XLSX.utils.json_to_sheet(data, header);
    XLSX.utils.book_append_sheet(wb, ws, '주문내역');
    XLSX.writeFile(wb, "order_list.xlsx");
}

function selectOrderListMain() {
    let inputData = {
        startOrderDate: $('#starting_date').val(),
        endOrderDate: $('#ending_date').val(),
        userNm: $('#user_nm').val(),
        userNo: ''
    };
    ajax('/admin/order_list/selectOrderListMain', inputData, 'selectOrderListMain', 'POST');
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
    let totalCnt = 0;
    for (let i = 0; i < ret.length; ++i) {
        let today = moment().format('YYYY-MM-DD');
        let orderNo = ret[i].orderNo;
        let orderSeq = ret[i].orderSeq;
        let orderDate = ret[i].orderDate;
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
        let cancelDate = '';
        let basicFares = ret[i].basicFares ? ret[i].basicFares : '';
        let boxType = ret[i].boxType ? ret[i].boxType : '';
        let fareType = ret[i].fareType ? ret[i].fareType : '';
        let invoiceCnt = ret[i].invoiceCnt;

        if (orderDate == today) {
            orderDate = '<span class="today-icon">오늘</span>' + orderDate;
        }

        if (isNull(ret[i].cancelDate) && isNull(dlvrConfirmDate)) {
            cancelDate = '<div id="cancel_order" class="cancel-order"><span class="text-underline-link">주문취소</span></div>';
        } else if (!isNull(ret[i].cancelDate)) {
            cancelDate = ret[i].cancelDate ? ret[i].cancelDate : '';
            orderDate = '<span style="color: #980000; font-weight: 700;">취소된 주문입니다.<span>';
        }

        if (isNull(depositConfirmDate)) {
            depositPersonNm += '<br><span class="confirm-deposit-btn text-underline-link" style="font-size: 11px;">입금확인</span>';
        }

        let hasInvoiceNo = true;
        if(isNull(dlvrConfirmDate)) {
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
        html += '<input type="hidden" class="basic-fares" value="' + basicFares + '">';
        html += '<input type="hidden" class="box-type" value="' + boxType + '">';
        html += '<input type="hidden" class="fare-type" value="' + fareType + '">';
        if (orderNo != prevOrderNo) {
            totalCnt += 1;
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
            html += '<div id="receive_person_nm" class="order-person-nm">' + receivePersonNm + '</div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="order_telno" class="order-telno">' + orderTelno + '</div>';
            html += '</td>';
            html += '<td style="vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="item_nm" class="item-nm">' + itemNm + '<br>' + optionNm + '</div>';
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
            html += '<div id="write_invoice_no" class="write-invoice-no">' + invoiceCnt + '건<br><span class="text-underline-link">입력</span></div>';
            html += '</td>';
            //html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + ';">';
            //html += '<div id="sms" class="sms"><span class="text-underline-link">문자입력</span></div>';
            //html += '</td>';
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
            html += '<div id="item_nm" class="item-nm">' + itemNm + '<br>' + optionNm + '</div>';
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

    $('.write-invoice-no').unbind();
    $('.write-invoice-no').click(function() {
        let orderNo = $(this).parent().parent().find('#order_no').text();
        $('#modal_order_no').val(orderNo);
        $('#invoice_no_modal').modal();
        selectInvoiceNo();
    });

    $('.write-additional-info').unbind();
    $('.write-additional-info').click(function() {
        let orderNo = $(this).parent().parent().find('#order_no').text();
        let basicFares = $(this).parent().parent().find('.basic-fares').val();
        let boxType = $(this).parent().parent().find('.box-type').val();
        let fareType = $(this).parent().parent().find('.fare-type').val();
        $('#modal_order_no_2').val(orderNo);
        $('#modal_basic_fares').val(basicFares);
        $('#modal_box_type').val(boxType);
        $('#modal_fare_type').val(fareType);
        $('#additional_info_modal').modal();
    });

    $('.sms').unbind();
    $('.sms').click(function() {
        let orderTelno = $(this).parent().parent().find('.order-telno').text();
        $('#smsTelno').val(orderTelno);
        $('#send_sms_modal').modal();
    });

    $('.cancel-order').unbind();
    $('.cancel-order').click(function() {
        if (confirm('해당 주문을 취소하시겠습니까?')) {
            let orderNo = $(this).parent().parent().parent().find('#order_no').text();
            cancelOrder(orderNo);
        }
    });

    $('#total_cnt').text('총 ' + totalCnt + '건');
}

function sendSMS() {
    if (!confirm('문자메세지를 전송하시겠습니까?')) {
        return;
    }
    let smsSubject = $('#sms_subject').val();
    let smsContent = $('#sms_content').val();
    let smsTelno = $('#smsTelno').val();
    let inputData = {
        smsSubject: smsSubject,
        smsContent: smsContent,
        smsTelno: smsTelno
    };
    ajax('/admin/order_list/sendSMS', inputData, 'sendSMS', 'POST');
}

function sendSMSCallback() {
    alert('메세지가 전송되었습니다.');
    $('#send_sms_close_modal').click();
}

function updateDepositConfirmDate(orderNo) {
    let inputData = {
        orderNo: orderNo
    };
    ajax('/admin/order_list/updateDepositConfirmDate', inputData, 'updateDepositConfirmDate', 'POST');
}

function updateDepositConfirmDateCallback() {
    alert('입금확인 처리되었습니다.');
    selectOrderListMain();
}

function updateDlvrConfirmDateCallback() {
    alert('배송시작 처리되었습니다.');
    selectOrderListMain();
}

function cancelOrder(orderNo) {
    let inputData = {
        orderNo: orderNo
    };
    ajax('/mypage/cancelOrder', inputData, 'cancelOrder', 'POST');
}

function cancelOrderCallback() {
    alert('주문이 취소되었습니다.');
    selectOrderListMain();
}
