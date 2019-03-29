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
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    selectAllUser();
});

function selectAllUser() {
    let inputData = {}
    ajax(serverUrl + '/user/selectAllUser', inputData, 'selectAllUser', 'POST');
}

function selectAllUserCallback(ret) {
    let html = '';
    for (let i = 0; i < ret.length; ++i) {
        let userNo = ret[i].userNo;
        let telno = ret[i].telno;
        let userNm = ret[i].userNm;
        let managerNm = ret[i].managerNm ? ret[i].managerNm : '';
        let managerTelno = ret[i].managerTelno ? ret[i].managerTelno : '';
        html += '<tr class="each-user" style="margin-bottom: 0px;">';
        html += '<input type="hidden" id="user_no" value="' + userNo + '">';
        html += '<td>' + telno + '</td>';
        html += '<td>' + userNm + '</td>';
        html += '<td>' + managerNm + '</td>';
        html += '<td>' + managerTelno + '</td>';
        html += '<td><a class="save-manager-telno-btn" style="text-decoration: underline; color: gray; font-size: 12px;">매니저지정</a></td>';
        html += '</tr>';
    }
    $('#user_list_tbody').append(html);

    $('.save-manager-telno-btn').unbind();
    $('.save-manager-telno-btn').click(function() {
        let userNo = $(this).parent().parent().find('#user_no').val();
        $('#modal_manager_telno').val('');
        $('#modal_user_no').val(userNo);
        $('#manager_modal').modal();
    });
}
