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

    $('#search_address_modal').click(function() {
        let keyword = $('#address_subject').val();
        searchAddressApi.searchAddress(1, keyword, constructAddress);
    });

    $('#address_subject').keydown(function(key) {
        if (key.keyCode == 13) {
            let keyword = $('#address_subject').val();
            searchAddressApi.searchAddress(1, keyword, constructAddress);
        }
    });
});

function constructAddress(ret) {
    $('#address_tbody').empty();
    let juso = ret.results.juso;
    let html = '';
    for (let i = 0; i < juso.length; ++i) {
        html += '<tr>';
        let roadAddrPart1 = juso[i].roadAddrPart1;
        let zipNo = juso[i].zipNo;
        html += '<td style="padding: 3px;">' + roadAddrPart1 + '</td>';
        html += '<td style="padding: 3px;">' + zipNo + '</td>';
        html += '</tr>';
    }
    searchAddressApi.totalCount = ret.results.common.totalCount;
    searchAddressApi.constructPagination();
    $('#address_tbody').append(html);
}

function searchAddress() {
    $('#address_modal').modal();
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
