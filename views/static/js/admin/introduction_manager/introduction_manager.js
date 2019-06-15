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
            } else if (gubun == 'saveIntroduction') {
                saveIntroductionCallback();
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    $('#introduction_save_btn').click(function() {
        saveIntroduction();
    });

    selectIntroduction();
});

function selectIntroduction() {
    let inputData = {};
    ajax('/admin/introduction_manager/selectIntroduction', inputData, 'selectIntroduction', 'POST');
}

function selectIntroductionCallback(ret) {
    $('#introduction_text').val(ret[0].introductionText);
}

function saveIntroduction() {
    let inputData = {
        introductionText: $('#introduction_text').val()
    };
    ajax('/admin/introduction_manager/saveIntroduction', inputData, 'saveIntroduction', 'POST');
}

function saveIntroductionCallback() {
    alert('농장소개가 등록되었습니다.');
}