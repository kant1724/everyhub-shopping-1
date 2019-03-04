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
                html += '<div class="my-2 mr-3 d-inline-block" style="overflow: hidden;"><img style="border-radius: 5px;" width="120px" src="' + productArr[i].imagePath + '" alt="" class="img-fluid z-depth-0"></div>';
                html += '<div class="my-2 d-inline-block" style="overflow: hidden;">';
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
    orderListMain.totalPrice = sum;
    $('#order_list').append(html);
    $('.mdb-select').materialSelect();

    $('.payment-btn').click(function() {
        insertOrderList();
    });
    $('.admin-page').click(function() {
        location.href = '/admin/product_manager';
    });
});

function insertOrderList() {
    orderListMain.orderPersonNm = $('#order_person_nm').val();
    orderListMain.orderTelno = $('#order_telno').val();
    orderListMain.receivePersonNm = $('#receive_person_nm').val();
    orderListMain.receiveTelno = $('#receive_telno').val();
    orderListMain.receiveAddress = $('#receive_address').val();
    orderListMain.orderRemarks = $('#order_remarks').val();
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