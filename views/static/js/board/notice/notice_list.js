function ajax(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
        async: false,
        xhrFields: { withCredentials: true },
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {
            if (gubun == 'selectNoticeList') {
                selectNoticeListCallback(data.ret);
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    $('#regist').click(function() {
        location.href = '/board/notice/notice_regist';
    });

    selectNoticeList();
});

function selectNoticeList() {
    let inputData = {};
    ajax('/board/notice/selectNoticeList', inputData, 'selectNoticeList', 'POST');
}

let allData = [];
function selectNoticeListCallback(ret) {
    let html = '';
    $('#notice_list_tbody').empty();

    for (let i = 0; i < ret.length; ++i) {
        let noticeNo = ret[i].noticeNo;
        let noticeTitle = ret[i].noticeTitle;
        let noticeDate = ret[i].noticeDate;

        let pt = '15px';
        html += '<tr style="margin-bottom: 0px;">';
        html += '<td style="vertical-align: middle; padding-top: ' + pt + '">';
        html += '<div id="notice_no" class="notice-no">' + noticeNo + '</div>';
        html += '</td>';
        html += '<td style="vertical-align: middle; padding-top: ' + pt + '">';
        html += '<div id="notice_title" class="notice-title" onclick="updateNotice(' + noticeNo + ')">' + noticeTitle + '</div>';
        html += '</td>';
        html += '<td style="vertical-align: middle; padding-top: ' + pt + '">';
        html += '<div id="notice_date" class="notice-date">' + noticeDate + '</div>';
        html += '</td>';
        html += '</tr>';
    }
    $('#notice_list_tbody').append(html);
}

function updateNotice(noticeNo) {
    location.href = '/board/notice/notice_modify?noticeNo=' + noticeNo;
}
