function ajax(url, input_data, gubun, method) {
    $.ajax(url, {
        type: method,
        data: input_data,
        async: false,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {},
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    $('.each-item').click(function() {
       location.href = '/product';
    });
    $('.smooth-goto').on('click', function() {
        $('html, body').animate({scrollTop: $(this.hash).offset().top - 60}, 1000);
        return false;
    });
});
