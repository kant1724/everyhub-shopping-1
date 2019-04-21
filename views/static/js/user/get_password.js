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
            } else if (gubun == 'confirmCertificationCode') {
                confirmCertificationCodeCallback(data.ret);
            } else if (gubun == 'modifyPassword') {
                modifyPasswordCallback(data.ret);
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    $('#get_certification_code').click(function() {
        getCertificationCode();
    });

    $('#confirm_certification_code').click(function() {
        confirmCertificationCode();
    });

    $('#modify_password').click(function() {
        modify_password();
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
        alert('인증번호가 정상적으로 전송되었습니다.');
        $('#get_certification_code').hide();
        $('#confirm_certification_code').show();
        $('#certification_code').show();
    } else {
        alert('해당 휴대폰 번호로 가입된 정보가 없습니다.');
    }
}

function confirmCertificationCode() {
    let telno = $('#telno').val();
    let certificationCode = $('#certification_code').val();
    let inputData = {
        telno: telno,
        certificationCode: certificationCode
    };
    ajax(serverUrl + '/user/confirmCertificationCode', inputData, 'confirmCertificationCode', 'POST');
}

function confirmCertificationCodeCallback(ret) {
    if (ret == 'ok') {
        alert('인증이 완료되었습니다. 새로운 비밀번호를 입력하세요.');
        $('#get_certification_code').hide();
        $('#confirm_certification_code').hide();
        $('#modify_password').show();
        $('#password').show();
        $('#password_confirm').show();
    } else {
        alert('인증번호가 잘못되었습니다. 다시 입력해 주세요.');
    }
}

function modify_password() {
    let telno = $('#telno').val();
    let certificationCode = $('#certification_code').val();
    let password = $('#password').val();
    let passwordConfirm = $('#password_confirm').val();
    if (password != passwordConfirm) {
        alert('패스워드와 패스워드 확인이 다릅니다. 다시 확인해 주세요.');
        return;
    }
    let inputData = {
        telno: telno,
        certificationCode: certificationCode,
        password: sha256(password)
    };
    ajax(serverUrl + '/user/modifyPassword', inputData, 'modifyPassword', 'POST');
}

function modifyPasswordCallback(ret) {
    if (ret == 'ok') {
        alert('비밀번호 변경에 성공하였습니다.');
        location.href = '/user'
    } else {
        alert('전화번호 또는 인증번호가 잘못되었습니다.');
    }
}
