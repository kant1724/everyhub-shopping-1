function ajax(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
        async: false,
        xhrFields: { withCredentials: true },
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {
            if (gubun == 'login') {
                loginCallback(data.ret);
            } else if (gubun == 'setToken') {
                setTokenCallback(data.ret);
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    $('#login').click(function() {
        login();
    });

    $('#sign_up').click(function() {
        sign_up();
    });

    $("#telno").keydown(function(key) {
        if (key.keyCode == 13) {
            login();
        }
    });

    $("#password").keydown(function(key) {
        if (key.keyCode == 13) {
            login();
        }
    });
});

function sign_up() {
    location.href = '/user/sign_up'
}

function login() {
    let telno = $('#telno').val();
    let password = $('#password').val();
    let inputData = {
        telno: telno,
        password: password
    }
    ajax(serverUrl + '/user/login', inputData, 'login', 'POST');
}

function loginCallback(ret) {
    if (ret != 'not ok') {
        let inputData = {
            token: ret
        };
        ajax('/user/setToken', inputData, 'setToken', 'POST');
    } else {
        alert('로그인 정보가 정확하지 않습니다.');
    }
}

function setTokenCallback(ret) {
    let gubun = $('#gubun').val();
    if (gubun == 'purchase') {
        let p = JSON.parse($('#param').val());
        let param = '';
        if (isNull(p.items)) {
            param += 'itemNo=' + p.itemNo;
            param += '&optionNo=' + p.optionNo;
            param += '&optionNm=' + p.optionNm;
            param += '&imagePath=' + p.imagePath;
            param += '&itemNm1=' + p.itemNm1;
            param += '&itemNm2=' + p.itemNm2;
            param += '&keepingMethod=' + p.keepingMethod;
            param += '&itemPrice=' + p.itemPrice;
            param += '&shippingFee=' + p.shippingFee;
            param += '&itemPriceNum=' + p.itemPriceNum;
            param += '&shippingFeeNum=' + p.shippingFeeNum;
            param += '&qty=' + p.qty;
        } else {
            param += 'items=' + p.items;
        }
        location.href = '/purchase?' + param;
    } else {
        location.href = '/';
    }
}
