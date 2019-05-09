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
            } else if (gubun == 'writeReview') {
                writeReviewCallback();
            } else if (gubun == 'selectUser') {
                selectUserCallback(data.ret);
            } else if (gubun == 'updateUser') {
                updateUserCallback();
            } else if (gubun == 'cancelOrder') {
                cancelOrderCallback();
            } else if (gubun == 'selectInvoiceNo') {
                selectInvoiceNoCallback(data.ret);
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
    let start = moment().subtract(7, 'days').format('YYYY-MM-DD');
    let end = moment().format('YYYY-MM-DD');
    $('#startingDate').val(start);
    $('#endingDate').val(end);

    $('#search').click(function() {
        selectOrderListMain();
    });

    $('.star').click(function() {
       let starValue = $(this).prop('id').split('_')[1];
       $('#star_value').val(starValue);
    });

    $('#write_review_btn').click(function() {
        writeReview();
    });

    $('#search_address').click(function() {
        $('#zip_no_id').val('zip_no');
        $('#address_main_id').val('address_main');
        $('#address_modal').modal();
        searchAddressApi.init();
    });

    $('#update_user').click(function() {
        if (!validationCheck()) {
            return;
        }
        updateUser();
    });

    selectOrderListMain();
});

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
        html += '<td class="modal-invoice-detail text-underline-link">조회</td>';
        html += '</tr>';
    }
    $('#invoice_list_tbody').append(html);

    $('.modal-invoice-detail').unbind();
    $('.modal-invoice-detail').click(function() {
        let invoiceNo = $(this).parent().find('.modal-invoice-no').text();
        window.open('https://www.doortodoor.co.kr/parcel/doortodoor.do?fsp_action=PARC_ACT_002&fsp_cmd=retrieveInvNoACT&invc_no=' + invoiceNo);
    });
}

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
        let orderSeq = ret[i].orderSeq;
        let orderDate = ret[i].orderDate;
        let itemNo = ret[i].itemNo;
        let itemNm = ret[i].itemNm;
        let optionNm = ret[i].optionNm;
        let qty = ret[i].qty ? ret[i].qty : '';
        let imagePath1 = ret[i].imagePath1;
        let totalPrice = ret[i].totalPrice;
        let depositConfirmDate = ret[i].depositConfirmDate;
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
        let dlvrConfirmDate = ret[i].dlvrConfirmDate;
        let cancelDate = ret[i].cancelDate;

        html += '<tr>';
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
            let pt = '20px';
            html += '<input id="item_no" type="hidden" value="' + itemNo + '">';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + ';">';
            html += '<div id="order_no" class="order-no">' + orderNo + '</div>';
            html += '<div id="modify_order" class="modify-order" style="margin-top: 10px;"><span class="text-underline-link" style="font-size: 11px;">정보수정</span></div>';
            html += '</td>';
            html += '<td style="vertical-align: middle;">';
            html += '<div id="order_detail" class="oreder-detail text-underline-link" style="margin-bottom: 10px; font-size: 11px;">상세정보</div>';
            html += '<div id="item_nm" class="item-nm">' + itemNm + '<br>' + optionNm;
            html += '<div>받는자: ' + receivePersonNm + '</div>';
            html += '<div class="write-review" style="margin-top: 10px;"><span class="text-underline-link" style="font-size: 11px;">후기작성</span></div></div>';
            html += '</td>';
            html += '<td style="vertical-align: middle;">';
            html += '<div id="qty" class="qty">' + qty + '</div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="total_price" class="total-price">' + numberWithCommas(totalPrice) + '</div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + ';">';
            html += '<div id="read_invoice_no" class="read-invoice-no"><span class="text-underline-link" style="font-size: 11px;">확인</span></div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + '">';
            if (dlvrConfirmDate != null && dlvrConfirmDate != '') {
                html += '취소불가';
            } else {
                if (cancelDate != null && cancelDate != '') {
                    html += '<span style="color: #980000; font-weight: 700;">취소완료<span>';
                } else {
                    html += '<div id="cancel_order" class="cancel-order"><span class="text-underline-link" style="font-size: 11px;">주문취소</span></div>';
                }
            }
            html += '</td>';
            html += '</tr>';
        } else {
            html += '<input id="item_no" type="hidden" value="' + itemNo + '">';
            html += '<td style="vertical-align: middle;">';
            html += '<div id="item_nm" class="item-nm">' + itemNm + '<br>' + optionNm + '<div class="write-review" style="margin-top: 10px; font-size: 10px; text-decoration: underline; color: gray;"><a>후기작성</a></div></div>';
            html += '</td>';
            html += '<td style="vertical-align: middle;">';
            html += '<div id="qty" class="qty">' + qty + '</div>';
            html += '</td>';
            html += '</tr>';
        }
        prevOrderNo = orderNo;
    }
    $('#order_list_tbody').append(html);
    $('.cancel-order').unbind();
    $('.cancel-order').click(function() {
        if (confirm('해당 주문을 취소하시겠습니까?')) {
            let orderNo = $(this).parent().parent().find('#order_no').text();
            cancelOrder(orderNo);
        }
    });
    $('.write-review').unbind();
    $('.write-review').click(function() {
        let itemNo = $(this).parent().parent().parent().find('#item_no').val();
        $('#item_no_modal').val(itemNo);
        $('#review_modal').modal();
    });
    $('.read-invoice-no').unbind();
    $('.read-invoice-no').click(function() {
        let orderNo = $(this).parent().parent().find('#order_no').text();
        $('#modal_order_no').val(orderNo);
        $('#invoice_no_modal').modal();
        selectInvoiceNo();
    });

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

    $('.modify-order').unbind();
    $('.modify-order').click(function() {
        let orderNo = $(this).parent().parent().find('#order_no').text();
        location.href = '/mypage/modify?orderNo=' + orderNo;
    });

    selectUser();
}

function validationCheck() {
    let telno1 = $('#telno_1').val();
    let telno2 = $('#telno_2').val();
    let telno3 = $('#telno_3').val();
    if (isNull(telno1) || isNull(telno2) || isNull(telno3)) {
        alert('휴대폰 번호를 정확히 입력하세요.');
        return false;
    }
    let password = $('#password').val();
    if (isNull(password)) {
        alert('패스워드를 입력하세요.');
        return false;
    }

    let passwordConfirm = $('#password_confirm').val();
    if (password != passwordConfirm) {
        alert('비밀번호 확인을 정확히 입력하세요.');
        return false;
    }

    let userNm = $('#user_nm').val();
    if (isNull(userNm)) {
        alert('이름을 입력하세요.');
        return false;
    }
    if ($('#gender_male').is(':checked')) {
    } else if ($('#gender_female').is(':checked')) {
    } else {
        alert('성별을 체크하세요.');
        return false;
    }
    let addressMain = $('#address_main').text();
    if (isNull(addressMain)) {
        alert('주소를 입력하세요.');
        return false;
    }
    let addressDetail = $('#address_detail').val();
    if (isNull(addressDetail)) {
        alert('상세주소를 입력하세요.');
        return false;
    }
    let zipNo = $('#zip_no').text();
    if (isNull(zipNo)) {
        alert('주소를 입력하세요.');
        return false;
    }

    return true;
}

function selectUser() {
    let inputData  = {};
    ajax(serverUrl + '/user/selectUser', inputData , 'selectUser', 'POST');
}

function selectUserCallback(ret) {
    if (ret.length > 0) {
        $('#user_nm').val(ret[0].userNm);
        $('#telno_1').val(ret[0].telno1);
        $('#telno_2').val(ret[0].telno2);
        $('#telno_3').val(ret[0].telno3);
        $('#user_nm').focus();
        $('#telno').focus();
        $('#zip_no').text(ret[0].zipNo);
        $('#address_main').text(ret[0].addressMain);
        $('#address_detail').val(ret[0].addressDetail);
        $('#date_of_birth_y').val(ret[0].dateOfBirthY);
        $('#date_of_birth_m').val(ret[0].dateOfBirthM);
        $('#date_of_birth_d').val(ret[0].dateOfBirthD);
        let gender = ret[0].gender;
        if (gender == 'M') {
            $('#gender_male').prop('checked', true);
        } else {
            $('#gender_female').prop('checked', true);
        }
    }
}

function writeReview() {
    let itemNo = $('#item_no_modal').val();
    let starValue = $('#star_value').val();
    let inputData = {
        subject: $('#review_subject').val(),
        content: $('#review_content').val(),
        star: starValue,
        itemNo: itemNo
    };
    ajax(serverUrl + '/mypage/writeReview', inputData, 'writeReview', 'POST');
}

function updateUser() {
    let gender = '';
    if ($('#gender_male').is('checked')) {
        gender = 'M';
    } else {
        gender = 'F';
    }
    let inputData = {
        userNm: $('#user_nm').val(),
        password: sha256($('#password').val()),
        telno: $('#telno_1').val() + $('#telno_2').val() + $('#telno_3').val(),
        telno1: $('#telno_1').val(),
        telno2: $('#telno_2').val(),
        telno3: $('#telno_3').val(),
        gender: gender,
        dateOfBirth: $('#date_of_birth_y').val() + $('#date_of_birth_m').val() + $('#date_of_birth_d').val(),
        dateOfBirthY: $('#date_of_birth_y').val(),
        dateOfBirthM: $('#date_of_birth_m').val(),
        dateOfBirthD: $('#date_of_birth_d').val(),
        zipNo: $('#zip_no').text(),
        addressMain: $('#address_main').text(),
        addressDetail: $('#address_detail').val()
    };
    ajax(serverUrl + '/mypage/updateUser', inputData, 'updateUser', 'POST');
}

function cancelOrder(orderNo) {
    let inputData = {
        orderNo: orderNo
    };
    ajax(serverUrl + '/mypage/cancelOrder', inputData, 'cancelOrder', 'POST');
}

function cancelOrderCallback() {
    alert('주문이 취소되었습니다.');
    selectOrderListMain();
}

function writeReviewCallback() {
    alert('후기가 작성되었습니다.');
}

function updateUserCallback() {
    alert('내정보가 변경되었습니다.');
}