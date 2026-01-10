function ajax(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
        async: false,
        xhrFields: { withCredentials: true },
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {
            if (gubun == 'updateNotice') {
                updateNoticeCallback(data.ret);
            } else if (gubun == 'selectNoticeDetail') {
                selectNoticeDetailCallback(data.ret);
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    $('#save_notice_btn').click(function() {
        updateNotice();
    });

    selectNoticeDetail();
});

function selectNoticeDetail() {
    let inputData = {
        noticeNo: $('#notice_no').val()
    };
    ajax('/board/notice/selectNoticeDetail', inputData, 'selectNoticeDetail', 'POST');
}

function updateNotice() {
    let noticeNo = $('#notice_no').val();
    let noticeTitle = $('#notice_title').val();
    let noticeContent = $('#notice_content').val();
    let inputData = {
        noticeNo: noticeNo,
        noticeTitle: noticeTitle,
        noticeContent: noticeContent
    };
    ajax('/board/notice/updateNotice', inputData, 'updateNotice', 'POST');
}

function selectNoticeDetailCallback(ret) {
    $('#notice_title').val(ret[0].noticeTitle);
    $('#notice_content').val(ret[0].noticeContent);
}

function updateNoticeCallback() {
    alert('알림마당이 변경되었습니다.');
    location.href = '/board/notice'
}
