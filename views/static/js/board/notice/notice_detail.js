function ajax(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
        async: false,
        xhrFields: { withCredentials: true },
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {
            if (gubun == 'selectNoticeDetail') {
                selectNoticeDetailCallback(data.ret);
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    $('#go_main_btn').click(function() {
        goMain();
    });

    selectNoticeDetail();
});

function selectNoticeDetail() {
    let inputData = {
        noticeNo: $('#notice_no').val()
    };
    ajax('/board/notice/selectNoticeDetail', inputData, 'selectNoticeDetail', 'POST');
}

function selectNoticeDetailCallback(ret) {
    $('#notice_title').text(ret[0].noticeTitle);
    $('#notice_content').text(ret[0].noticeContent);
}

function goMain() {
    location.href = '/'
}
