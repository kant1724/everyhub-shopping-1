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
            } else if (gubun == 'logout') {
                logoutCallback();
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
    let start = moment().subtract(1, 'months').format('YYYY-MM-DD');
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

    $('#logout').click(function() {
        logout();
    });

    selectOrderListMain();
});

function logout() {
    let inputData = {};
    ajax(serverUrl + '/user/logout', inputData, 'logout', 'POST');
}

function logoutCallback() {
    location.href = '/user/logout';
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
        html += '</tr>';
    }
    $('#invoice_list_tbody').append(html);
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
        let orderDate = ret[i].orderDate;
        let itemNo = ret[i].itemNo;
        let itemNm = ret[i].itemNm;
        let optionNm = ret[i].optionNm;
        let qty = ret[i].qty ? ret[i].qty : '';
        let imagePath = ret[i].imagePath;
        let totalPrice = ret[i].totalPrice;
        let depositConfirmDate = ret[i].depositConfirmDate;
        let dlvrConfirmDate = ret[i].dlvrConfirmDate;
        let cancelDate = ret[i].cancelDate;

        if (orderNo != prevOrderNo) {
            let rs = rowspan[orderNo];
            html += '<tr style="margin-bottom: 0px;">';
            let pt = '15px';
            html += '<input id="item_no" type="hidden" value="' + itemNo + '">';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + ';">';
            html += '<div id="order_no" class="order-no">' + orderNo + '</div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + ';">';
            html += '<div id="order_date" class="oreder-date"><div>' + orderDate + '</div><div class="write-review text-underline-link" style="margin-top: 10px;"><a>후기작성</a></div></div>';
            html += '</td>';
            html += '<td style="vertical-align: middle;">';
            html += '<div id="image_path" class="image-path"><img src="' + imagePath + '" width="70" style="border-radius: 5px;"></div>';
            html += '</td>';
            html += '<td style="vertical-align: middle;">';
            html += '<div id="item_nm" class="item-nm">' + itemNm + '</div>';
            html += '</td>';
            html += '<td style="vertical-align: middle;">';
            html += '<div id="option_nm" class="option-nm">' + optionNm + '</div>';
            html += '</td>';
            html += '<td style="vertical-align: middle;">';
            html += '<div id="qty" class="qty">' + qty + '</div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="total_price" class="total-price">' + numberWithCommas(totalPrice) + '</div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + ';">';
            html += '<div id="read_invoice_no" class="read-invoice-no"><span class="text-underline-link">확인</span></div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="width: 110px; vertical-align: middle; padding-top: ' + pt + '">';
            if (dlvrConfirmDate != null && dlvrConfirmDate != '') {
                html += '취소불가';
            } else {
                if (cancelDate != null && cancelDate != '') {
                    html += cancelDate;
                } else {
                    html += '<div id="cancel_order" class="cancel-order"><span class="text-underline-link">주문취소</span></div>';
                }
            }
            html += '</td>';
            html += '</tr>';
        } else {
            html += '<tr>';
            html += '<input id="item_no" type="hidden" value="' + itemNo + '">';
            html += '<td style="vertical-align: middle;">';
            html += '<div id="image_path" class="image-path"><img src="' + imagePath + '" width="70" style="border-radius: 5px;"></div>';
            html += '</td>';
            html += '<td style="vertical-align: middle;">';
            html += '<div id="item_nm" class="item-nm">' + itemNm + '</div>';
            html += '</td>';
            html += '<td style="vertical-align: middle;">';
            html += '<div id="option_nm" class="option-nm">' + optionNm + '</div>';
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
        $('#password').val(ret[0].password);
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
        password: $('#password').val(),
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