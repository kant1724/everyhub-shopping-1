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
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
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
         updateUser();
    });

    datepicker.init();
    selectOrderListMain();
});

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
        let orderDate = ret[i].orderDate;
        let itemNo = ret[i].itemNo;
        let itemNm1 = ret[i].itemNm1;
        let invoiceNo = ret[i].invoiceNo ? ret[i].invoiceNo : '';
        let imagePath = ret[i].imagePath;
        let totalPrice = ret[i].totalPrice;
        let depositConfirmDate = ret[i].depositConfirmDate;
        let dlvrConfirmDate = ret[i].dlvrConfirmDate;
        let cancelDate = ret[i].cancelDate;

        if (orderNo != prevOrderNo) {
            let rs = rowspan[orderNo];
            html += '<tr style="margin-bottom: 0px;">';
            let pt = '20px';
            html += '<input id="item_no" type="hidden" value="' + itemNo + '">';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + ';">';
            html += '<div id="order_no" class="order-no">' + orderNo + '</div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + ';">';
            html += '<div id="order_date" class="oreder-date">' + orderDate + '</div>';
            html += '</td>';
            html += '<td style="vertical-align: middle;">';
            html += '<div id="item_nm_1" class="item-nm-1">' + itemNm1 + '</div>';
            html += '</td>';
            html += '<td style="vertical-align: middle;">';
            html += '<div id="write_review" class="write-review"><a class="common-button-1">후기작성</a></div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="total_price" class="total-price">' + numberWithCommas(totalPrice) + '</div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + '">';
            if (dlvrConfirmDate != null && dlvrConfirmDate != '') {
                html += '취소불가';
            } else {
                if (cancelDate != null && cancelDate != '') {
                    html += cancelDate;
                } else {
                    html += '<div id="cancel_order" class="cancel-order"><a class="common-button-1">주문취소</a></div>';
                }
            }
            html += '</td>';
            html += '<td style="vertical-align: middle;">';
            html += '<div id="invoice_no" class="invoice-no">' + invoiceNo + '</div>';
            html += '</td>';
            html += '</tr>';
        } else {
            html += '<tr>';
            html += '<input id="item_no" type="hidden" value="' + itemNo + '">';
            html += '<td style="vertical-align: middle;">';
            html += '<div id="item_nm_1" class="item-nm-1">' + itemNm1 + '</div>';
            html += '</td>';
            html += '<td style="vertical-align: middle;">';
            html += '<div id="write_review" class="write-review"><a class="common-button-1">후기작성</a></div>';
            html += '</td>';
            html += '<td style="vertical-align: middle;">';
            html += '<div id="invoice_no" class="invoice-no">' + invoiceNo + '</div>';
            html += '</td>';
            html += '</tr>';
        }
        prevOrderNo = orderNo;
    }
    $('#order_list_tbody').append(html);
    $('.cancel-order').unbind();
    $('.cancel-order').click(function() {
        let orderNo = $(this).parent().parent().find('#order_no').text();
        cancelOrder(orderNo);
    });
    $('.write-review').unbind();
    $('.write-review').click(function() {
        let itemNo = $(this).parent().parent().find('#item_no').val();
        $('#item_no_modal').val(itemNo);
        $('#review_modal').modal();
    });

    selectUser();
}

function selectUser() {
    let inputData  = {};
    ajax(serverUrl + '/user/selectUser', inputData , 'selectUser', 'POST');
}

function selectUserCallback(ret) {
    if (ret.length > 0) {
        $('#user_nm').val(ret[0].userNm);
        $('#password').val(ret[0].password);
        $('#telno').val(ret[0].telno);
        $('#user_nm').focus();
        $('#telno').focus();
        $('#zip_no').text(ret[0].zipNo);
        $('#address_main').text(ret[0].addressMain);
        $('#address_detail').val(ret[0].addressDetail);
        $('#date_of_birth').val(ret[0].dateOfBirth);
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
        password: $('#password').val(),
        telno: $('#telno').val(),
        gender: gender,
        dateOfBirth: $('#date_of_birth').val(),
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