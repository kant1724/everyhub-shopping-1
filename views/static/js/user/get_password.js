function ajax(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
        async: false,
        xhrFields: { withCredentials: true },
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {
            if (gubun == 'getCertificationCode') {
                getCertificationCodeCallback(data.ret);
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    $('#get_certification_code').click(function() {
        getCertificationCode();
    });
});

function getCertificationCode() {
    let telno = $('#telno').val();
    let inputData = {
        telno: telno
    };
    ajax(serverUrl + '/user/getCertificationCode', inputData, 'getCertificationCode', 'POST');
}

function getCertificationCodeCallback(ret) {
    if (ret == 'ok') {
        alert('비밀번호가 정상적으로 전송되었습니다.');
        location.href = '/user';
    } else if (ret == 'already') {
        alert('하루에 2회이상 비밀번호 전송을 할 수 없습니다.');
    } else {
        alert('해당 휴대폰 번호로 가입된 정보가 없습니다.');
    }
}
