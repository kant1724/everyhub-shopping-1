function ajax(url, input_data, gubun, method) {
    $.ajax(url, {
        type: method,
        data: input_data,
        async: false,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {
            if (gubun == "checkLogin") {
                checkLoginCallback(data.res);
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    $('#login').click(function() {
        checkLogin();
    });

    $('#sign_up').click(function() {
        sign_up();
    });
});

function sign_up() {
    location.href = '/user/sign_up'
}

function checkLogin() {
    let userId = $('#userId').val();
    let password = $('#password').val();
    let companyNo = $('#companyNo').val();
    let input = {"companyNo" : companyNo, "userId" : userId, "password" : password}
    ajax('/login/checkLogin', input, 'checkLogin', 'POST');
}

function checkLoginCallback(data) {
    location.href = '/frame';
}
