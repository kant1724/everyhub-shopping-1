function ajax(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
        async: false,
        xhrFields: { withCredentials: true },
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {
            if (gubun == "goSigningUp") {
                goSigningUpCallback(data.ret);
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    $('.datepicker').pickadate(datepickerOption);

    $('#go_signing_up_btn').click(function() {
        goSigningUp();
    });

    $('#search_address').click(function() {
        searchAddress();
    });
});

function searchAddress() {
    const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
    const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;
    const w = 700;
    const h = 600;
    const l = (window.screen.width / 2) - (w / 2) + dualScreenLeft;
    const t = (window.screen.height / 2) - (h / 2) + dualScreenTop - 50;
    window.open('/address/', '_blank', 'location=1,status=1,scrollbars=1, resizable=0, directories=1, toolbar=1, titlebar=1, width=' + w + ', height=' + h + ', left=' + l + ', top=' + t);
}

function goSigningUp() {
    let telno = $('#telno').val();
    let password = $('#password').val();
    let userNm = $('#user_nm').val();
    let gender = 'M';
    if ($('#gender_male').is(':checked')) {
        gender = 'M';
    } else if ($('#gender_female').is(':checked')) {
        gender = 'F';
    }
    let dateOfBirth = $('#date_of_birth').val();
    let address = $('#address1').val() + ' ' + $('#address2').val() + ' ' + $('#address3').val() + ' ' + $('#address4').val();
    let inputData = {
        telno: telno,
        password: password,
        userNm: userNm,
        gender: gender,
        dateOfBirth: dateOfBirth,
        address: address
    }
    ajax(serverUrl + '/user/goSigningUp', inputData, 'goSigningUp', 'POST');
}

function goSigningUpCallback(ret) {
    if (ret == 'not ok') {
        alert('이미 등록된 휴대폰 번호입니다.');
    } else {
        alert('회원가입이 완료되었습니다.')
    }
}
