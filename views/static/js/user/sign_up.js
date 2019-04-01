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
            } else if (gubun == 'checkDup') {
                checkDupCallback(data.ret);
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    $('#go_signing_up_btn').click(function() {
        goSigningUp();
    });

    $('#search_address').click(function() {
        searchAddress();
    });

    $('#search_address').click(function() {
        $('#zip_no_id').val('zip_no');
        $('#address_main_id').val('address_main');
        $('#address_modal').modal();
        searchAddressApi.init();
    });

    $('#check_dup').click(function() {
        checkDup();
    });

    $('#telno_1').keyup(function(event) {
        if (event.which == 37 || event.which == 38 || event.which == 39 || event.which == 40) return;
        let val = $(this).val();
        if (val.length >= 3) {
            $('#telno_2').focus();
        }
    });

    $('#telno_2').keyup(function(event) {
        if (event.which == 37 || event.which == 38 || event.which == 39 || event.which == 40) return;
        let val = $(this).val();
        if (val.length >= 4) {
            $('#telno_3').focus();
        }
    });
});

function searchAddress() {
    $('#address_modal').modal();
}

function goSigningUp() {
    if (isDup) {
        alert('중복체크를 확인해주세요.');
        return;
    }
    if (!validationCheck()) {
        return;
    }

    let telno = $('#telno_1').val() + $('#telno_2').val() + $('#telno_3').val();
    let telno1 = $('#telno_1').val();
    let telno2 = $('#telno_2').val();
    let telno3 = $('#telno_3').val();
    let password = $('#password').val();
    let userNm = $('#user_nm').val();
    let gender = 'M';
    if ($('#gender_male').is(':checked')) {
        gender = 'M';
    } else if ($('#gender_female').is(':checked')) {
        gender = 'F';
    }
    let dateOfBirth = $('#date_of_birth_y').val() + $('#date_of_birth_m').val() + $('#date_of_birth_d').val();
    let dateOfBirthY = $('#date_of_birth_y').val();
    let dateOfBirthM = $('#date_of_birth_m').val();
    let dateOfBirthD = $('#date_of_birth_d').val();
    let addressMain = $('#address_main').text();
    let addressDetail = $('#address_detail').val();
    let zipNo = $('#zip_no').text();
    let inputData = {
        telno: telno,
        telno1: telno1,
        telno2: telno2,
        telno3: telno3,
        password: password,
        userNm: userNm,
        gender: gender,
        dateOfBirth: dateOfBirth,
        dateOfBirthY: dateOfBirthY,
        dateOfBirthM: dateOfBirthM,
        dateOfBirthD: dateOfBirthD,
        zipNo: zipNo,
        addressMain: addressMain,
        addressDetail: addressDetail
    };
    ajax(serverUrl + '/user/goSigningUp', inputData, 'goSigningUp', 'POST');
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

function goSigningUpCallback(ret) {
    if (ret == 'not ok') {
        alert('이미 등록된 휴대폰 번호입니다.');
    } else {
        alert('회원가입이 완료되었습니다.')
        location.href = '/user'
    }
}

function checkDup() {
    let telno = $('#telno_1').val() + $('#telno_2').val() + $('#telno_3').val();
    if (isNull(telno)) {
        alert('휴대폰 번호를 입력하세요.');
        return;
    }
    let inputData = {
        telno: telno
    };
    ajax(serverUrl + '/user/checkDup', inputData, 'checkDup', 'POST');
}

let isDup = true;
function checkDupCallback(ret) {
    if (ret == 'ok') {
        alert('가입할 수 있는 휴대폰 번호입니다.');
        isDup = false;
    } else {
        alert('이미 가입된 휴대폰 번호입니다.');
    }
}
