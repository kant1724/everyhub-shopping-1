function ajax(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
        async: false,
        xhrFields: { withCredentials: true },
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {
            if (gubun == 'insertNotice') {
                insertNoticeCallback(data.ret);
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    $('#save_notice_btn').click(function() {
        insertNotice();
    });
});

function insertNotice() {
    let noticeTitle = $('#notice_title').val();
    let noticeContent = $('#notice_content').val();
    let inputData = {
        noticeTitle: noticeTitle,
        noticeContent: noticeContent
    };
    ajax('/board/notice/insertNotice', inputData, 'insertNotice', 'POST');
}

function insertNoticeCallback() {
    alert('알림마당이 저장되었습니다.');
    location.href = '/board/notice'
}

