let headerHtml = '<nav class="top-nav navbar fixed-top navbar-expand-lg navbar-light white">';
headerHtml += '<div class="container">';
headerHtml += '<button id="side_nav" class="navbar-toggler" type="button" data-toggle="collapse" aria-expanded="false" aria-label="Toggle navigation">';
headerHtml += '<span class="navbar-toggler-icon"></span>';
headerHtml += '</button>';
headerHtml += '<div class="collapse navbar-collapse" id="top_menu">';
headerHtml += '<ul class="navbar-nav">';
if ($('#user_no').val() == 0) {
    headerHtml += '<li class="nav-item" style="margin-left: 0px;">';
    headerHtml += '<a class="nav-link waves-effect waves-light dark-grey-text font-weight-bold" href="/user">';
    headerHtml += '&nbsp;&nbsp;&nbsp;로그인';
    headerHtml += '</a>';
    headerHtml += '</li>';
} else {
    headerHtml += '<li class="nav-item" style="margin-left: 0px;">';
    headerHtml += '<a class="nav-link waves-effect waves-light dark-grey-text font-weight-bold" href="/mypage">';
    headerHtml += '&nbsp;&nbsp;&nbsp;마이페이지';
    headerHtml += '</a>';
    headerHtml += '</li>';
    headerHtml += '<li class="nav-item" style="margin-left: 0px;">';
    headerHtml += '<a id="logout" class="nav-link waves-effect waves-light dark-grey-text font-weight-bold">';
    headerHtml += '&nbsp;&nbsp;&nbsp;로그아웃';
    headerHtml += '</a>';
    headerHtml += '</li>';
}
if ($('#admin_yn').val() == 'Y') {
    headerHtml += '<li class="nav-item" style="margin-left: 0px;">';
    headerHtml += '<a class="admin-page nav-link waves-effect waves-light dark-grey-text font-weight-bold" href="/admin/product_manager">';
    headerHtml += '&nbsp;&nbsp;&nbsp;상품관리';
    headerHtml += '</a>';
    headerHtml += '</li>';
    headerHtml += '<li class="nav-item" style="margin-left: 0px;">';
    headerHtml += '<a class="admin-page nav-link waves-effect waves-light dark-grey-text font-weight-bold" href="/admin/order_list">';
    headerHtml += '&nbsp;&nbsp;&nbsp;주문목록';
    headerHtml += '</a>';
    headerHtml += '</li>';
}
headerHtml += '</ul>';
headerHtml += '</div>';
headerHtml += '<a id="top_center" class="logo-title navbar-brand font-weight-bold" href="/">';
headerHtml += '<strong>간드락닷컴</strong>';
headerHtml += '</a>';
headerHtml += '<i id="go_shopping_cart" style="font-size: 22px;" class="pr-3 far fa-shopping-cart"></i>';
headerHtml += '</div>';
headerHtml += '</nav>';

$('header').append(headerHtml);

function logout(url) {
    $.ajax(url, {
        type: 'POST',
        data: '',
        async: false,
        xhrFields: { withCredentials: true },
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {},
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$('#logout').click(function() {
    logout('/user/logout');
    location.href = '/user/logout';
});
