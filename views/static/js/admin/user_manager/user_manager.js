function ajax(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
        async: false,
        xhrFields: { withCredentials: true },
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {
            if (gubun == 'selectAllUser') {
                selectAllUserCallback(data.ret);
            } else if (gubun == 'updateManagerNo') {
                updateManagerNoCallback(data.ret);
            } else if (gubun == 'sendSMS') {
                sendSMSCallback();
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    $('#update_manager_no').click(function() {
        updateManagerNo();
    });

    $('#check_all').click(function() {
        checkAll();
    });

    $('#send_sms_btn').click(function() {
        let list = $('#user_list_tbody').find('.select-user');
        let cnt = 0;
        for (let i = 0; i < list.length; ++i) {
            if ($(list[i]).prop('checked')) {
                cnt += 1;
            }
        }
        if (cnt == 0) {
            alert('한건이상 선택해 주세요.');
            return;
        }
        $('#send_sms_modal').modal();
    });

    $('#send_sms').click(function() {
        if (isNull($('#sms_subject').val())) {
            alert('제목을 입력하세요.');
            return;
        }
        if (isNull($('#sms_content').val())) {
            alert('내용을 입력하세요.');
            return;
        }
        sendSMS();
    });

    constructUserList.init(selectAllUser);

    selectAllUser();
});

function checkAll() {
    if ($('#check_all').is(':checked')) {
        $('#user_list_tbody').find('.select-user').prop('checked', true);
    } else {
        $('#user_list_tbody').find('.select-user').prop('checked', false);
    }
}

function selectAllUser() {
    let inputData = {
        lastUserNo: constructUserList.lastUserNo,
        limit: constructUserList.idPerPage * constructUserList.pageLength
    };
    ajax('/user/selectAllUser', inputData, 'selectAllUser', 'POST');
}

function selectAllUserCallback(ret) {
    constructUserList.selectCallback(ret)
}

function updateManagerNo() {
    let inputData = {
        userNo: $('#modal_user_no').val(),
        managerTelno: $('#modal_manager_telno').val()
    };
    ajax( '/admin/user_manager/updateManagerNo', inputData, 'updateManagerNo', 'POST');
}

function updateManagerNoCallback(ret) {
    if (ret == 'not ok') {
        alert('해당 휴대폰 번호로 등록된 매니저가 없습니다.');
    } else {
        alert('업데이트가 완료되었습니다.');
        selectAllUser();
        $('#manager_close_modal').click();
    }
}

function sendSMS() {
    if (!confirm('문자메세지를 전송하시겠습니까?')) {
        return;
    }
    let smsSubject = $('#sms_subject').val();
    let smsContent = $('#sms_content').val();
    let smsTelno = '';
    let list = $('#user_list_tbody').find('.select-user');
    for (let i = 0; i < list.length; ++i) {
        if ($(list[i]).prop('checked')) {
            smsTelno += $(list[i]).prop('id') + ';';
        }
    }
    smsTelno = smsTelno.substring(0, smsTelno.length - 1);
    let inputData = {
        smsSubject: smsSubject,
        smsContent: smsContent,
        smsTelno: smsTelno
    };
    ajax('/admin/user_manager/sendSMS', inputData, 'sendSMS', 'POST');
}

function sendSMSCallback() {
    alert('문자가 정상적으로 발송되었습니다.');
    $('#send_sms_close_modal').click();
}