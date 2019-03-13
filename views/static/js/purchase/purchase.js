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
        insertOrderList();
    });
    $('.admin-page').click(function() {
        location.href = '/admin/product_manager';
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

    $('#same_with_order_info').click(function() {
        if ($('#order_person_nm').val() == '' || $('#order_telno').val() == '') {
            alert('주문자 정보를 입력하세요.');
            return false;
        }
        setSendInfoSameWithOrderInfo(true);
    });

    $('#order_person_nm').change(function() {
        setSendInfoSameWithOrderInfo(false);
    });

    $('#order_telno').change(function() {
        setSendInfoSameWithOrderInfo(false);
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
});

function setSenderInput() {
    if ($('#has_sender').is(':checked')) {
        $('.sender-input').show();
    } else {
        $('.sender-input').hide();
    }
}

function setSendInfoSameWithOrderInfo(focus) {
    if ($('#same_with_order_info').is(':checked')) {
        $('#receive_person_nm').val($('#order_person_nm').val());
        $('#receive_telno').val($('#order_telno').val());
        if (focus) {
            $('#receive_person_nm').focus();
            $('#receive_telno').focus();
        }
    }
}

function purchaseDirect() {
    let html = '';
    let eachOrder = {};
    eachOrder.qty = $('#direct_qty').val();
    eachOrder.itemNo = $('#direct_item_no').val();
    html += '<div class="my-2 mr-4 d-inline-block" style="overflow: hidden;"><img style="border-radius: 5px;" width="120px" src="' + $('#direct_image_path').val() + '" alt="" class="img-fluid z-depth-0"></div>';
    html += '<div class="my-2 d-inline-block" style="overflow: hidden; vertical-align: top">';
    html += '<div class="mb-2"><i class="far fa-check-circle"></i>&nbsp;&nbsp;상품명: ' + $('#direct_item_nm_1').val() + ' ' + $('#direct_item_qty').val() + '과 / ' + $('#direct_item_kg').val() + 'KG</div>';
    html += '<div class="mb-2"><i class="far fa-check-circle"></i>&nbsp;&nbsp;단가: ' + $('#direct_item_price').val() + '</div>';
    html += '<div class="mb-2"><i class="far fa-check-circle"></i>&nbsp;&nbsp;수량: ' + $('#direct_qty').val() + '</div>';
    html += '<div><i class="far fa-check-circle"></i>&nbsp;&nbsp;가격: ' + numberWithCommas(Number($('#direct_item_price_num').val()) * Number($('#direct_qty').val())) + '원</div>';
    html += '</div>';
    html += '<hr>';
    orderListDetail.push(eachOrder);
    let sum = Number($('#direct_item_price_num').val()) * Number($('#direct_qty').val());
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
                html += '<div style="font-size: 20px; font-weight: 700; color: gray;"><i class="far fa-list"></i>&nbsp;&nbsp;주문' + cnt + '</div>';
                html += '<hr>';
                html += '<div class="my-2 mr-4 d-inline-block" style="overflow: hidden;"><img style="border-radius: 5px;" width="120px" src="' + productArr[i].imagePath + '" alt="" class="img-fluid z-depth-0"></div>';
                html += '<div class="my-2 d-inline-block" style="overflow: hidden; vertical-align: top">';
                html += '<div class="mb-2"><i class="far fa-check-circle"></i>&nbsp;&nbsp;상품명: ' + productArr[j].itemNm1 + ' ' + productArr[j].itemQty + '과 / ' + productArr[j].itemKg + 'KG</div>';
                html += '<div class="mb-2"><i class="far fa-check-circle"></i>&nbsp;&nbsp;단가: ' + productArr[j].itemPrice + '</div>';
                html += '<div class="mb-2"><i class="far fa-check-circle"></i>&nbsp;&nbsp;수량: ' + productArr[j].qty + '</div>';
                html += '<div><i class="far fa-check-circle"></i>&nbsp;&nbsp;가격: ' + numberWithCommas(productArr[j].itemPriceNum * productArr[j].qty) + '원</div>';
                html += '</div>';
                html += '<hr>';
                orderListDetail.push(eachOrder);
                cnt += 1;
                sum += productArr[j].itemPriceNum * productArr[j].qty;
            }
        }
    }
    html += '<div style="font-size: 22px; font-weight: 700; color: red;"><i class="far fa-won-sign"></i>&nbsp;&nbsp;총금액: ' + numberWithCommas(sum) + '원</div>';
    $('#order_list').append(html);

    orderListMain.totalPrice = sum;
}

function insertOrderList() {
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
    alert('주문이 완료되었습니다.\n0000-000-00000 계좌로 입금해 주세요.');
}
