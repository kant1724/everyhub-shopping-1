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
                insertOrderListCallback(data.ret);
            } else if (gubun == 'selectUser') {
                selectUserCallback(data.ret);
            } else if (gubun == 'selectSellerInfo') {
                selectSellerInfoCallback(data.ret);
            } else if (gubun == 'selectOneItem') {
                selectOneItemCallback(data.ret);
            } else if (gubun == 'selectShippingInfoByZipNo') {
                selectShippingInfoByZipNoCallback(data.ret);
            } else if (gubun == 'selectRecentReceiver') {
                selectRecentReceiverCallback(data.ret);
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

let orderListDetail = [];
let orderListMain = {};
let recentReceiver = [];
let rowNo;
$(document).ready(function() {
    $('.mdb-select').materialSelect();

    $("#container").jsGrid({
        width: "100%",
        height: "300px",
        filtering: false,
        editing: false,
        inserting: false,
        sorting: false,
        paging: true,
        autoload: true,
        pageSize: 150,
        pageButtonCount: 10,
        data: recentReceiver,
        fields: [
            { name: "받는자 전화번호", type: "text", width: 100 },
            { name: "받는자 주소", type: "text", width: 150, align: "center" }
        ],
        rowClick: function(args) {
            let $row = this.rowByItem(args.item);
            $row.children('.jsgrid-cell').css('background-color', '#B2CCFF');
            $row.children('.jsgrid-cell').css('border-color', '#B2CCFF');
            rowNo = args.item['번호'];
            for (let i = 0; i < recentReceiverData.length; ++i) {
                if (recentReceiverData[i].num == rowNo) {
                    $('#receive_person_nm').val(recentReceiverData[i].receivePersonNm);
                    $('#receive_person_nm').focus();
                    $('#receive_telno_1').val(recentReceiverData[i].receiveTelno1);
                    $('#receive_telno_2').val(recentReceiverData[i].receiveTelno2);
                    $('#receive_telno_3').val(recentReceiverData[i].receiveTelno3);
                    $('#receive_zip_no').text(recentReceiverData[i].receiveZipNo);
                    $('#receive_address_main').text(recentReceiverData[i].receiveAddressMain);
                    $('#receive_address_detail').val(recentReceiverData[i].receiveAddressDetail);
                    $('#receive_address_detail').focus();
                    $('#recent_receiver_close_modal').click();
                }
            }
        }
    });

    $('.payment-btn').click(function() {
        if (validationCheck()) {
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

    $('#recent_receiver').click(function() {
        $('#recent_receiver_modal').modal();
    });

    $('#search_recent_receiver_modal').click(function() {
        selectRecentReceiver();
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

    selectUser();
    selectSellerInfo();
});

function selectUser() {
    let inputData  = {
        userNo: $('#user_no').val()
    };
    ajax('/user/selectUser', inputData , 'selectUser', 'POST');
}

function selectUserCallback(ret) {
    if (ret.length > 0) {
        $('#order_person_nm').val(ret[0].userNm);
        $('#order_person_nm').focus();
        $('#order_telno').val(ret[0].telno);
        $('#order_telno_1').val(ret[0].telno1);
        $('#order_telno_2').val(ret[0].telno2);
        $('#order_telno_3').val(ret[0].telno3);
        $('#order_zip_no').val(ret[0].zipNo);
        $('#order_address_main').val(ret[0].addressMain);
        $('#order_address_detail').val(ret[0].addressDetail);
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

function purchaseDirect() {
    selectOneItem();
}

function selectOneItem() {
    let itemNo = $('#direct_item_no').val();
    let inputData  = {
        itemNo: itemNo
    };
    ajax('/admin/item_manager/selectOneItem', inputData , 'selectOneItem', 'POST');
}

function selectOneItemCallback(ret) {
    let html = '';
    let eachOrder = {};
    eachOrder.qty = $('#direct_qty').val();
    eachOrder.itemNo = $('#direct_item_no').val();
    eachOrder.itemNm = $('#direct_item_nm').val();
    eachOrder.optionNo = $('#direct_option_no').val();
    eachOrder.optionNm = $('#direct_option_nm').val();
    eachOrder.keepingMethod = ret[0].keepingMethod;
    eachOrder.damageRemarks = ret[0].damageRemarks;

    html += '<div style="font-size: 11px;">';
    html += '<div class="mt-2 mb-2 mr-4 d-inline-block" style="overflow: hidden;"><img style="border-radius: 5px;" width="120px" src="' + $('#direct_image_path').val() + '" alt="" class="img-fluid z-depth-0"></div>';
    html += '<div class="mb-2 d-inline-block" style="overflow: hidden; vertical-align: top">';
    html += '<div class="mb-2">상품명: ' + $('#direct_item_nm').val() + '</div>';
    html += '<div class="mb-2">옵션: ' + $('#direct_option_nm').val() + '</div>';
    html += '<div class="mb-2">단가: ' + $('#direct_item_price').val() + '</div>';
    html += '<div class="mb-2">배송비: ' + $('#direct_shipping_fee').val() + '</div>';
    html += '<div class="mb-2">수량: ' + $('#direct_qty').val() + '</div>';
    html += '<div>가격: ' + numberWithCommas((Number($('#direct_item_price_num').val()) + Number($('#direct_shipping_fee_num').val())) * Number($('#direct_qty').val())) + '원</div>';
    html += '</div>';
    html += '</div>';
    orderListDetail.push(eachOrder);
    let sum = (Number($('#direct_item_price_num').val()) + Number($('#direct_shipping_fee_num').val())) * Number($('#direct_qty').val());
    $('#total_price_text').text('총 결제금액: ' + numberWithCommas(sum) + '원');
    $('#order_list').append(html);

    orderListMain.totalPrice = sum;
    orderListMain.totalQty =  Number($('#direct_qty').val());
}

function purchaseFromCart() {
    let itemArr = $('#items').val().split(';');
    let productArr = JSON.parse(localStorage.getItem('product'));
    let html = '';
    let cnt = 1;
    let sum = 0;
    orderListMain.totalQty = 0;
    for (let i = 0; i < itemArr.length; ++i) {
        for (let j = 0; j < productArr.length; ++j) {
            if (productArr[j].id == itemArr[i]) {
                let eachOrder = {};
                eachOrder.qty = productArr[j].qty;
                eachOrder.itemNo = productArr[j].itemNo;
                eachOrder.itemNm = productArr[j].itemNm;
                eachOrder.keepingMethod = productArr[j].keepingMethod;
                eachOrder.damageRemarks = productArr[j].damageRemarks;
                eachOrder.optionNo = productArr[j].optionNo;
                eachOrder.optionNm = productArr[j].optionNm;

                html += '<div style="font-size: 20px; font-weight: 700; color: gray;"><i class="far fa-list"></i>&nbsp;&nbsp;주문' + cnt + '</div>';
                html += '<hr>';
                html += '<div style="font-size: 11px;">';
                html += '<div class="mt-2 mb-2 mr-4 d-inline-block" style="overflow: hidden;"><img style="border-radius: 5px;" width="120px" src="' + productArr[i].imagePath + '" alt="" class="img-fluid z-depth-0"></div>';
                html += '<div class="mb-2 d-inline-block" style="overflow: hidden; vertical-align: top">';
                html += '<div class="mb-2">상품명: ' + productArr[j].itemNm + '</div>';
                html += '<div class="mb-2">옵션: ' + productArr[j].optionNm + '</div>';
                html += '<div class="mb-2">단가: ' + productArr[j].itemPrice + '</div>';
                html += '<div class="mb-2">배송비: ' + productArr[j].shippingFee + '</div>';
                html += '<div class="mb-2">수량: ' + productArr[j].qty + '</div>';
                html += '<div>가격: ' + numberWithCommas((Number(productArr[j].itemPriceNum) + Number(productArr[j].shippingFeeNum)) * productArr[j].qty) + '원</div>';
                html += '</div>';
                html += '</div>';
                orderListDetail.push(eachOrder);
                cnt += 1;
                sum += (Number(productArr[j].itemPriceNum) + Number(productArr[j].shippingFeeNum)) * productArr[j].qty;
                orderListMain.totalQty +=  Number(productArr[j].qty);
            }
        }
    }
    $('#total_price_text').text('총 결제금액: ' + numberWithCommas(sum) + '원');
    $('#order_list').append(html);

    orderListMain.totalPrice = sum;
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

function insertOrderList() {
    orderListMain.acno = '\n' + $('#seller_acno').val() + '\n' + $('#seller_deposit_person_nm').val();
    orderListMain.orderPersonNm = $('#order_person_nm').val();
    orderListMain.orderTelno = $('#order_telno_1').val() + $('#order_telno_2').val() + $('#order_telno_3').val();
    orderListMain.orderTelno1 = $('#order_telno_1').val();
    orderListMain.orderTelno2 = $('#order_telno_2').val();
    orderListMain.orderTelno3 = $('#order_telno_3').val();
    orderListMain.sendPersonNm = '';
    orderListMain.sendTelno = '';
    orderListMain.sendTelno1 = '';
    orderListMain.sendTelno2 = '';
    orderListMain.sendTelno3 = '';
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
    if (orderListMain.additionalShippingFee == null) {
        orderListMain.additionalShippingFee = 0;
    }
    orderListMain.totalPrice += orderListMain.additionalShippingFee;
    orderListMain.sellerNo = 1;
    let inputData = {
        data: JSON.stringify(
            {
                orderListMain: orderListMain,
                orderListDetail: orderListDetail
            })
    };
    ajax('/purchase/insertOrderList', inputData, 'insertOrderList', 'POST');
}

function insertOrderListCallback(ret) {
    if (ret == 'not ok') {
        alert('주문 오류가 발생하였습니다. 지속적으로 문제발생 시 크롬 브라우저를 이용하여 주문하시기 바랍니다.');
        return;
    }
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

    window.location.replace('/purchase/purchase_complete');
}

function selectSellerInfo() {
    let inputData = {
        sellerNo: 1
    };
    ajax('/user/selectSellerInfo', inputData, 'selectSellerInfo', 'POST');
}

function selectSellerInfoCallback(ret) {
    $('#seller_acno').val(ret[0].acno);
    $('#seller_deposit_person_nm').val(ret[0].depositPersonNm);
}

function selectShippingInfoByZipNo(zipNo) {
    let inputData = {
        zipNo: zipNo
    };
    ajax('/admin/delivery_manager/selectShippingInfoByZipNo', inputData, 'selectShippingInfoByZipNo', 'POST');
}

function selectShippingInfoByZipNoCallback(ret) {
    orderListMain.additionalShippingFee = 0;
    $('#additional_shipping_fee_text').hide();
    $('#total_price_text').text('총 결제금액: ' + numberWithCommas(orderListMain.totalPrice) + '원');
    if (ret.length > 0) {
        if (ret[0].includingKeyword != '') {
            if ($('#receive_address_main').text().indexOf(ret[0].includingKeyword) == -1) {
                return;
            }
        }
        orderListMain.additionalShippingFee = Number(ret[0].shippingFee) * orderListMain.totalQty;
        $('#additional_shipping_fee_text').text('해당지역은 추가배송료가 있습니다. +' + numberWithCommas(orderListMain.additionalShippingFee) + '원');
        $('#additional_shipping_fee_text').show();
        $('#total_price_text').text('총 결제금액: ' + numberWithCommas(orderListMain.totalPrice + orderListMain.additionalShippingFee) + '원');
    }
}

function selectRecentReceiver() {
    let inputData = {
        telno: $('#telno_subject').val()
    };
    ajax('/admin/order_list/selectRecentReceiver', inputData, 'selectRecentReceiver', 'POST');
}

let recentReceiverData = [];
function selectRecentReceiverCallback(ret) {
    recentReceiver = [];
    recentReceiverData = [];
    for (let i = 0; i < ret.length; ++i) {
        let a = {};
        a['번호'] = i;
        a['받는자 전화번호'] = ret[i].receiveTelno;
        a['받는자 주소'] = ret[i].receiveZipNo + ' ' + ret[i].receiveAddressMain + ' ' + ret[i].receiveAddressDetail;
        recentReceiver.push(a);

        let b = {};
        b.num = i;
        b.receivePersonNm = ret[i].receivePersonNm;
        b.receiveTelno1 = ret[i].receiveTelno1;
        b.receiveTelno2 = ret[i].receiveTelno2;
        b.receiveTelno3 = ret[i].receiveTelno3;
        b.receiveZipNo = ret[i].receiveZipNo;
        b.receiveAddressMain = ret[i].receiveAddressMain;
        b.receiveAddressDetail = ret[i].receiveAddressDetail;

        recentReceiverData.push(b);
    }

    $("#container").jsGrid("option", "data", recentReceiver);
}
