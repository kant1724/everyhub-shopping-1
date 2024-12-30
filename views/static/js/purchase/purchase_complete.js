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
        let searchParams = new URLSearchParams(location.search);
        $('#items').val(searchParams.get('items'));
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
    });
    $('.re-order').click(function() {
        let searchParams = new URLSearchParams(location.search);
        let url = new URL(window.location.origin + '/purchase');
        url.search = searchParams;
        window.location.href = url.href;
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