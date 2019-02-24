function ajax(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
        async: false,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {},
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    $('.mdb-select').materialSelect();
    $('.payment-btn').click(function() {
       alert("주문이 완료되었습니다.\n0000-000-00000 계좌로 입금해 주세요.");
    });

});
