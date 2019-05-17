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
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    $('#update_manager_no').click(function() {
        updateManagerNo();
    });

    constructUserList.init(selectAllUser);

    selectAllUser();
});

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