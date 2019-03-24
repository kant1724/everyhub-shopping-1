function ajax(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
        async: false,
        xhrFields: { withCredentials: true },
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {
            if (gubun == 'insertOrderList') {
                insertOrderListCallback();
            } else if (gubun == 'selectUser') {
                selectUserCallback(data.ret);
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

let orderListDetail = [];
let orderListMain = {};
$(document).ready(function() {
    $('.mdb-select').materialSelect();

    $('.payment-btn').click(function() {
        if (checkValid()) {
            if (confirm('해당내용으로 주문하시겠습니까?')) {
                insertOrderList();
            }
        }
    });

    if ($('#items').val() != '') {
        purchaseFromCart();
    } else {
        purchaseDirect();
    }

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

    selectUser();
});

function selectUser() {
    let inputData  = {};
    ajax(serverUrl + '/user/selectUser', inputData , 'selectUser', 'POST');
}

function selectUserCallback(ret) {
    if (ret.length > 0) {
        $('#order_person_nm').val(ret[0].userNm);
        $('#order_telno').val(ret[0].telno);
        $('#order_person_nm').focus();
        $('#order_telno').focus();
        $('#order_zip_no').val(ret[0].zipNo);
        $('#order_address_main').val(ret[0].addressMain);
        $('#order_address_detail').val(ret[0].addressDetail);
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
        $('#send_telno').val($('#order_telno').val());
        $('#send_zip_no').text($('#order_zip_no').val());
        $('#send_address_main').text($('#order_address_main').val());
        $('#send_address_detail').val($('#order_address_detail').val());
        if (focus) {
            $('#send_person_nm').focus();
            $('#send_telno').focus();
            $('#send_address_detail').focus();
            $('#sender_same_with_order_info').focus();
        }
    }
}

function setReceiveInfoSameWithOrderInfo(focus) {
    if ($('#receiver_same_with_order_info').is(':checked')) {
        $('#receive_person_nm').val($('#order_person_nm').val());
        $('#receive_telno').val($('#order_telno').val());
        $('#receive_zip_no').text($('#order_zip_no').val());
        $('#receive_address_main').text($('#order_address_main').val());
        $('#receive_address_detail').val($('#order_address_detail').val());
        if (focus) {
            $('#receive_person_nm').focus();
            $('#receive_telno').focus();
            $('#receive_address_detail').focus();
            $('#receiver_same_with_order_info').focus();
        }
    }
}

function purchaseDirect() {
    let html = '';
    let eachOrder = {};
    eachOrder.qty = $('#direct_qty').val();
    eachOrder.itemNo = $('#direct_item_no').val();
    eachOrder.itemNm1 = $('#direct_item_nm_1').val();
    eachOrder.optionNo = $('#direct_option_no').val();
    html += '<div style="font-size: 11px;">';
    html += '<div class="mt-2 mb-2 mr-4 d-inline-block" style="overflow: hidden;"><img style="border-radius: 5px;" width="120px" src="' + $('#direct_image_path').val() + '" alt="" class="img-fluid z-depth-0"></div>';
    html += '<div class="mb-2 d-inline-block" style="overflow: hidden; vertical-align: top">';
    html += '<div class="mb-2">상품명: ' + $('#direct_item_nm_1').val() + '</div>';
    html += '<div class="mb-2">옵션: ' + $('#direct_option_nm').val() + '</div>';
    html += '<div class="mb-2">단가: ' + $('#direct_item_price').val() + '</div>';
    html += '<div class="mb-2">배송비: ' + $('#direct_shipping_fee').val() + '</div>';
    html += '<div class="mb-2">수량: ' + $('#direct_qty').val() + '</div>';
    html += '<div>가격: ' + numberWithCommas((Number($('#direct_item_price_num').val()) + Number($('#direct_shipping_fee_num').val())) * Number($('#direct_qty').val())) + '원</div>';
    html += '</div>';
    html += '</div>';
    html += '<hr>';
    let qty = Number($('#direct_qty').val());
    for (let i = 0; i < qty; ++i) {
        orderListDetail.push(eachOrder);
    }
    let sum = (Number($('#direct_item_price_num').val()) + Number($('#direct_shipping_fee_num').val())) * Number($('#direct_qty').val());
    html += '<div style="font-size: 16px; font-weight: 700; color: red;"><i class="far fa-won-sign"></i>&nbsp;&nbsp;총금액: ' + numberWithCommas(sum) + '원</div>';
    $('#order_list').append(html);

    orderListMain.totalPrice = sum;
}

function purchaseFromCart() {
    let itemArr = $('#items').val().split(';');
    let productArr = JSON.parse(localStorage.getItem('product'));
    let html = '';
    let cnt = 1;
    let sum = 0;
    for (let i = 0; i < itemArr.length; ++i) {
        for (let j = 0; j < productArr.length; ++j) {
            if (productArr[j].id == itemArr[i]) {
                let eachOrder = {};
                eachOrder.qty = productArr[j].qty;
                eachOrder.itemNo = productArr[j].itemNo;
                eachOrder.itemNm1 = productArr[j].itemNm1;
                eachOrder.optionNo = productArr[j].optionNo;
                html += '<div style="font-size: 20px; font-weight: 700; color: gray;"><i class="far fa-list"></i>&nbsp;&nbsp;주문' + cnt + '</div>';
                html += '<hr>';
                html += '<div style="font-size: 11px;">';
                html += '<div class="mt-2 mb-2 mr-4 d-inline-block" style="overflow: hidden;"><img style="border-radius: 5px;" width="120px" src="' + productArr[i].imagePath + '" alt="" class="img-fluid z-depth-0"></div>';
                html += '<div class="mb-2 d-inline-block" style="overflow: hidden; vertical-align: top">';
                html += '<div class="mb-2">상품명: ' + productArr[j].itemNm1 + '</div>';
                html += '<div class="mb-2">옵션: ' + productArr[j].optionNm + '</div>';
                html += '<div class="mb-2">단가: ' + productArr[j].itemPrice + '</div>';
                html += '<div class="mb-2">배송비: ' + productArr[j].shippingFee + '</div>';
                html += '<div class="mb-2">수량: ' + productArr[j].qty + '</div>';
                html += '<div>가격: ' + numberWithCommas((Number(productArr[j].itemPriceNum) + Number(productArr[j].shippingFeeNum)) * productArr[j].qty) + '원</div>';
                html += '</div>';
                html += '</div>';
                html += '<hr>';
                orderListDetail.push(eachOrder);
                cnt += 1;
                sum += (Number(productArr[j].itemPriceNum) + Number(productArr[j].shippingFeeNum)) * productArr[j].qty;
            }
        }
    }
    html += '<div style="font-size: 22px; font-weight: 700; color: red;"><i class="far fa-won-sign"></i>&nbsp;&nbsp;총금액: ' + numberWithCommas(sum) + '원</div>';
    $('#order_list').append(html);

    orderListMain.totalPrice = sum;
}

function checkValid() {
    if (isNull($('#order_person_nm').val())) {
        alert('주문자명을 입력하세요.');
        return false;
    }
    if (isNull($('#order_telno').val())) {
        alert('주문자 전화번호를 입력하세요.');
        return false;
    }

    return true;
}

function insertOrderList() {
    orderListMain.acno = '11111-11111-1111';
    orderListMain.orderPersonNm = $('#order_person_nm').val();
    orderListMain.orderTelno = $('#order_telno').val();
    orderListMain.sendPersonNm = '';
    orderListMain.sendTelno = '';
    orderListMain.sendZipNo = '';
    orderListMain.sendAddressMain = '';
    orderListMain.sendAddressDetail = '';
    if ($('#has_sender').is(':checked')) {
        orderListMain.sendPersonNm = $('#send_person_nm').val();
        orderListMain.sendTelno = $('#send_telno').val();
        orderListMain.sendZipNo = $('#send_zip_no').text();
        orderListMain.sendAddressMain = $('#send_address_main').text();
        orderListMain.sendAddressDetail = $('#send_address_detail').val();
    }
    orderListMain.receivePersonNm = $('#receive_person_nm').val();
    orderListMain.receiveTelno = $('#receive_telno').val();
    orderListMain.receiveZipNo = $('#receive_zip_no').text();
    orderListMain.receiveAddressMain = $('#receive_address_main').text();
    orderListMain.receiveAddressDetail = $('#receive_address_detail').val();
    orderListMain.orderRemarks = $('#order_remarks').val();
    orderListMain.depositPersonNm = $('#deposit_person_nm').val();
    orderListMain.depositRemarks = $('#deposit_remarks').val();
    orderListMain.sellerNo = 1;

    let inputData = {
        data: JSON.stringify(
            {
                orderListMain: orderListMain,
                orderListDetail: orderListDetail
            })
    };
    ajax(serverUrl + '/purchase/insertOrderList', inputData, 'insertOrderList', 'POST');
}

function insertOrderListCallback() {
    let itemArr = $('#items').val().split(';');
    if (itemArr != null && itemArr != '') {
        let productArr = JSON.parse(localStorage.getItem('product'));
        for (let i = 0; i < itemArr.length; ++i) {
            for (let j = 0; j < productArr.length; ++j) {
                if (productArr[j].id == itemArr[i]) {
                    productArr.splice(j, 1);
                }
            }
        }
        localStorage.setItem('product', JSON.stringify(productArr));
    }

    location.href = '/purchase/purchase_complete';
}
