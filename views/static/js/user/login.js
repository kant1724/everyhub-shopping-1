function ajax(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
        async: false,
        xhrFields: { withCredentials: true },
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {
            if (gubun == "login") {
                loginCallback(data.ret);
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
        location.href = '/?token=' + ret;
    } else {
        alert(ret);
    }
}
