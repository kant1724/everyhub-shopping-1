function ajax(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
        async: false,
        xhrFields: { withCredentials: true },
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {
            if (gubun == 'selectIntroduction') {
                selectIntroductionCallback(data.ret);
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    selectIntroduction();
});

function selectIntroduction() {
    let inputData = {};
    ajax('/admin/introduction_manager/selectIntroduction', inputData, 'selectIntroduction', 'POST');
}

function selectIntroductionCallback(ret) {
    let text = ret[0].introductionText;
    text = text.replace(/\n/gi, '<br>');

    $('#introduction_text').html(text);
}