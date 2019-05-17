function ajax(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
        async: false,
        xhrFields: { withCredentials: true },
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {
            if (gubun == 'selectSellerInfo') {
                selectSellerInfoCallback(data.ret);
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    $('.go-main').click(function() {
        location.href = '/';
    });

    selectSellerInfo();
});

function selectSellerInfo() {
    let inputData = {
        sellerNo: 1
    };
    ajax( '/user/selectSellerInfo', inputData, 'selectSellerInfo', 'POST');
}

function selectSellerInfoCallback(ret) {
    $('#seller_acno').text(ret[0].acno);
    $('#seller_deposit_person_nm').text(ret[0].depositPersonNm);
}