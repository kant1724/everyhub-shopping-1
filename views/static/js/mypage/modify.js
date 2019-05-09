function ajax(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
        async: false,
        xhrFields: { withCredentials: true },
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {
            if (gubun == 'updateOrderList') {
                updateOrderListCallback();
            } else if (gubun == 'selectOrderListMain') {
                selectOrderListMainCallback(data.ret);
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

let orderListMain = {};
$(document).ready(function() {
    $('.mdb-select').materialSelect();

    $('.modify-btn').click(function() {
        if (validationCheck()) {
            if (confirm('해당내용으로 변경 하시겠습니까?')) {
                updateOrderList();
            }
        }
    });

    $('#order_radio').click(function () {
        $('#deposit_person_nm').val($('#order_person_nm').val());
        $('#deposit_person_nm').focus();
    });

    $('#send_radio').click(function () {
        $('#deposit_person_nm').val($('#send_person_nm').val());
        $('#deposit_person_nm').focus();
    });

    $('#receive_radio').click(function () {
        $('#deposit_person_nm').val($('#receive_person_nm').val());
        $('#deposit_person_nm').focus();
    });

    $('#sender_same_with_order_info').click(function() {
        if ($('#order_person_nm').val() == '' || $('#order_telno').val() == '') {
            alert('주문자 정보를 입력하세요.');
            return false;
        }
        setSendInfoSameWithOrderInfo(true);
    });

    $('#receiver_same_with_order_info').click(function() {
        if ($('#order_person_nm').val() == '' || $('#order_telno').val() == '') {
            alert('주문자 정보를 입력하세요.');
            return false;
        }
        setReceiveInfoSameWithOrderInfo(true);
    });

    $('#order_person_nm').change(function() {
        setSendInfoSameWithOrderInfo(false);
        setReceiveInfoSameWithOrderInfo(false);
    });

    $('#order_telno').change(function() {
        setSendInfoSameWithOrderInfo(false);
        setReceiveInfoSameWithOrderInfo(false);
    });

    $('#has_sender').click(function() {
        setSenderInput();
    });

    $('#search_send_address').click(function() {
        $('#zip_no_id').val('send_zip_no');
        $('#address_main_id').val('send_address_main');
        $('#address_modal').modal();
        searchAddressApi.init();
    });

    $('#search_receive_address').click(function() {
        $('#zip_no_id').val('receive_zip_no');
        $('#address_main_id').val('receive_address_main');
        $('#address_modal').modal();
        searchAddressApi.init();
    });

    $('#order_telno_1').keyup(function(event) {
        if (event.which == 37 || event.which == 38 || event.which == 39 || event.which == 40) return;
        let val = $(this).val();
        if (val.length >= 3) {
            $('#order_telno_2').focus();
        }
    });

    $('#order_telno_2').keyup(function(event) {
        if (event.which == 37 || event.which == 38 || event.which == 39 || event.which == 40) return;
        let val = $(this).val();
        if (val.length >= 4) {
            $('#order_telno_3').focus();
        }
    });

    $('#send_telno_1').keyup(function(event) {
        if (event.which == 37 || event.which == 38 || event.which == 39 || event.which == 40) return;
        let val = $(this).val();
        if (val.length >= 3) {
            $('#send_telno_2').focus();
        }
    });

    $('#send_telno_2').keyup(function(event) {
        if (event.which == 37 || event.which == 38 || event.which == 39 || event.which == 40) return;
        let val = $(this).val();
        if (val.length >= 4) {
            $('#send_telno_3').focus();
        }
    });

    $('#receive_telno_1').keyup(function(event) {
        if (event.which == 37 || event.which == 38 || event.which == 39 || event.which == 40) return;
        let val = $(this).val();
        if (val.length >= 3) {
            $('#receive_telno_2').focus();
        }
    });

    $('#receive_telno_2').keyup(function(event) {
        if (event.which == 37 || event.which == 38 || event.which == 39 || event.which == 40) return;
        let val = $(this).val();
        if (val.length >= 4) {
            $('#receive_telno_3').focus();
        }
    });

    selectOrderListMain();
});

function selectOrderListMain() {
    let inputData = {
        orderNo: $('#order_no').val()
    };
    ajax(serverUrl + '/admin/order_list/selectOrderListMainByOrderNo', inputData, 'selectOrderListMain', 'POST');
}

function selectOrderListMainCallback(ret) {
    if (ret.length > 0) {
        $('#order_person_nm').val(ret[0].orderPersonNm);
        $('#order_person_nm').focus();
        $('#order_telno').val(ret[0].orderTelno);
        $('#order_telno_1').val(ret[0].orderTelno1);
        $('#order_telno_2').val(ret[0].orderTelno2);
        $('#order_telno_3').val(ret[0].orderTelno3);
        $('#order_zip_no').text(ret[0].orderZipNo);
        $('#order_address_main').text(ret[0].orderAddressMain);
        $('#order_address_detail').val(ret[0].orderAddressDetail);

        if (!isNull(ret[0].sendPersonNm)) {
            $('#has_sender').click();
        }

        $('#send_person_nm').val(ret[0].sendPersonNm);
        $('#send_person_nm').focus();
        $('#send_telno').val(ret[0].sendTelno);
        $('#send_telno_1').val(ret[0].sendTelno1);
        $('#send_telno_2').val(ret[0].sendTelno2);
        $('#send_telno_3').val(ret[0].sendTelno3);
        $('#send_zip_no').text(ret[0].sendZipNo);
        $('#send_address_main').text(ret[0].sendAddressMain);
        $('#send_address_detail').val(ret[0].sendAddressDetail);
        $('#send_address_detail').focus();

        $('#receive_person_nm').val(ret[0].receivePersonNm);
        $('#receive_person_nm').focus();
        $('#receive_telno').val(ret[0].receiveTelno);
        $('#receive_telno_1').val(ret[0].receiveTelno1);
        $('#receive_telno_2').val(ret[0].receiveTelno2);
        $('#receive_telno_3').val(ret[0].receiveTelno3);
        $('#receive_zip_no').text(ret[0].receiveZipNo);
        $('#receive_address_main').text(ret[0].receiveAddressMain);
        $('#receive_address_detail').val(ret[0].receiveAddressDetail);
        $('#receive_address_detail').focus();

        $('#order_remarks').val(ret[0].orderRemarks);
        $('#deposit_person_nm').val(ret[0].depositPersonNm);
        $('#deposit_person_nm').focus();
        $('#deposit_remarks').val(ret[0].depositRemarks);

        $('body, html').animate({'scrollTop': 0}, 0);
    }
}

function setSenderInput() {
    if ($('#has_sender').is(':checked')) {
        $('.sender-input').show(500);
    } else {
        $('.sender-input').hide(500);
    }
}

function setSendInfoSameWithOrderInfo(focus) {
    if ($('#sender_same_with_order_info').is(':checked')) {
        $('#send_person_nm').val($('#order_person_nm').val());
        $('#send_telno_1').val($('#order_telno_1').val());
        $('#send_telno_2').val($('#order_telno_2').val());
        $('#send_telno_3').val($('#order_telno_3').val());
        $('#send_zip_no').text($('#order_zip_no').val());
        $('#send_address_main').text($('#order_address_main').val());
        $('#send_address_detail').val($('#order_address_detail').val());
        if (focus) {
            $('#send_person_nm').focus();
            $('#send_address_detail').focus();
            $('#sender_same_with_order_info').focus();
        }
    }
}

function setReceiveInfoSameWithOrderInfo(focus) {
    if ($('#receiver_same_with_order_info').is(':checked')) {
        $('#receive_person_nm').val($('#order_person_nm').val());
        $('#receive_telno_1').val($('#order_telno_1').val());
        $('#receive_telno_2').val($('#order_telno_2').val());
        $('#receive_telno_3').val($('#order_telno_3').val());
        $('#receive_zip_no').text($('#order_zip_no').val());
        $('#receive_address_main').text($('#order_address_main').val());
        $('#receive_address_detail').val($('#order_address_detail').val());
        if (focus) {
            $('#receive_person_nm').focus();
            $('#receive_address_detail').focus();
            $('#receiver_same_with_order_info').focus();
        }
    }
}

function validationCheck() {
    if (isNull($('#order_person_nm').val())) {
        alert('주문자명을 입력하세요.');
        return false;
    } else if (isNull($('#order_telno_1').val()) || isNull($('#order_telno_2').val()) || isNull($('#order_telno_3').val())) {
        alert('주문자 휴대폰 번호를 입력하세요.');
        return false;
    } else if (isNull($('#receive_person_nm').val())) {
        alert('받는자명을 입력하세요');
        return false;
    } else if (isNull($('#receive_telno_1').val()) || isNull($('#receive_telno_2').val()) || isNull($('#receive_telno_3').val())) {
        alert('받는자 휴대폰 번호를 입력하세요.');
        return false;
    } else if (isNull($('#receive_address_main').text())) {
        alert('받는자 주소를 입력하세요');
        return false;
    } else if (isNull($('#receive_address_detail').val())) {
        alert('받는자 상세주소를 입력하세요');
        return false;
    } else if (isNull($('#deposit_person_nm').val())) {
        alert('입금자명을 입력하세요');
        return false;
    }

    return true;
}

function updateOrderList() {
    orderListMain.orderNo = $('#order_no').val();
    orderListMain.orderPersonNm = $('#order_person_nm').val();
    orderListMain.orderTelno = $('#order_telno_1').val() + $('#order_telno_2').val() + $('#order_telno_3').val();
    orderListMain.orderTelno1 = $('#order_telno_1').val();
    orderListMain.orderTelno2 = $('#order_telno_2').val();
    orderListMain.orderTelno3 = $('#order_telno_3').val();
    orderListMain.sendPersonNm = '';
    orderListMain.sendTelno = '';
    orderListMain.sendZipNo = '';
    orderListMain.sendAddressMain = '';
    orderListMain.sendAddressDetail = '';
    if ($('#has_sender').is(':checked')) {
        orderListMain.sendPersonNm = $('#send_person_nm').val();
        orderListMain.sendTelno = $('#send_telno_1').val() + $('#send_telno_2').val() + $('#send_telno_3').val();
        orderListMain.sendTelno1 = $('#send_telno_1').val();
        orderListMain.sendTelno2 = $('#send_telno_2').val();
        orderListMain.sendTelno3 = $('#send_telno_3').val();
        orderListMain.sendZipNo = $('#send_zip_no').text();
        orderListMain.sendAddressMain = $('#send_address_main').text();
        orderListMain.sendAddressDetail = $('#send_address_detail').val();
    }
    orderListMain.receivePersonNm = $('#receive_person_nm').val();
    orderListMain.receiveTelno = $('#receive_telno_1').val() + $('#receive_telno_2').val() + $('#receive_telno_3').val();
    orderListMain.receiveTelno1 = $('#receive_telno_1').val();
    orderListMain.receiveTelno2 = $('#receive_telno_2').val();
    orderListMain.receiveTelno3 = $('#receive_telno_3').val();
    orderListMain.receiveZipNo = $('#receive_zip_no').text();
    orderListMain.receiveAddressMain = $('#receive_address_main').text();
    orderListMain.receiveAddressDetail = $('#receive_address_detail').val();
    orderListMain.orderRemarks = $('#order_remarks').val();
    orderListMain.depositPersonNm = $('#deposit_person_nm').val();
    orderListMain.depositRemarks = $('#deposit_remarks').val();

    let inputData = {
        data: JSON.stringify(
            {
                orderListMain: orderListMain
            })
    };
    ajax(serverUrl + '/mypage/updateOrderList', inputData, 'updateOrderList', 'POST');
}

function updateOrderListCallback() {
    alert('내용이 수정되었습니다.');
    location.href = '/mypage/';
}

function selectShippingInfoByZipNo(zipNo) {
    let inputData = {
        zipNo: zipNo
    };
    ajax(serverUrl + '/admin/delivery_manager/selectShippingInfoByZipNo', inputData, 'selectShippingInfoByZipNo', 'POST');
}