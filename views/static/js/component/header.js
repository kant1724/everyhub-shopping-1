function logout() {
    location.href = '/user/logout';
}

let headerHtml = '<nav class="top-nav navbar fixed-top navbar-expand-lg navbar-light white">';
headerHtml += '<div class="container">';
headerHtml += '<a class="logo-title navbar-brand font-weight-bold" href="/">';
headerHtml += '<strong>간드락닷컴</strong>';
headerHtml += '</a>';
headerHtml += '<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent-4" aria-controls="navbarSupportedContent-4"';
headerHtml += 'aria-expanded="false" aria-label="Toggle navigation">';
headerHtml += '<span class="navbar-toggler-icon"></span>';
headerHtml += '</button>';
headerHtml += '<div class="collapse navbar-collapse" id="navbarSupportedContent-4">';
headerHtml += '<ul class="navbar-nav ml-auto">';
headerHtml += '<li class="nav-item" style="margin-left: 0px;">';
headerHtml += '<a class="nav-link waves-effect waves-light" href="/cart">';
headerHtml += '<i class="far fa-shopping-cart"></i>&nbsp;&nbsp;장바구니';
headerHtml += '</a>';
headerHtml += '</li>';
if ($('#user_no').val() == 0) {
    headerHtml += '<li class="nav-item" style="margin-left: 0px;">';
    headerHtml += '<a class="nav-link waves-effect waves-light" href="/user">';
    headerHtml += '<i class="far fa-sign-in-alt"></i>&nbsp;&nbsp;로그인';
    headerHtml += '</a>';
    headerHtml += '</li>';
    headerHtml += '<li class="nav-item" style="margin-left: 0px;">';
    headerHtml += '<a class="nav-link waves-effect waves-light" href="/user/sign_up">';
    headerHtml += '<i class="far fa-user-plus"></i>&nbsp;&nbsp;회원가입';
    headerHtml += '</a>';
    headerHtml += '</li>';
} else {
    headerHtml += '<li class="nav-item" style="margin-left: 0px;">';
    headerHtml += '<a class="nav-link waves-effect waves-light" href="/mypage">';
    headerHtml += '<i class="far fa-user"></i>&nbsp;&nbsp;마이페이지';
    headerHtml += '</a>';
    headerHtml += '</li>';
    headerHtml += '<li class="nav-item" style="margin-left: 0px;">';
    headerHtml += '<a id="logout" class="nav-link waves-effect waves-light">';
    headerHtml += '<i class="far fa-sign-out-alt"></i>&nbsp;&nbsp;로그아웃';
    headerHtml += '</a>';
    headerHtml += '</li>';
}
if ($('#admin_yn').val() == 'Y') {
    headerHtml += '<li class="nav-item" style="margin-left: 0px;">';
    headerHtml += '<a class="nav-link waves-effect waves-light" href="/admin/introduction_manager">';
    headerHtml += '<i class="fal fa-address-book"></i>&nbsp;&nbsp;소개글관리';
    headerHtml += '</a>';
    headerHtml += '</li>';
    headerHtml += '<li class="nav-item" style="margin-left: 0px;">';
    headerHtml += '<a class="nav-link waves-effect waves-light" href="/board/notice">';
    headerHtml += '<i class="far fa-user-plus"></i>&nbsp;&nbsp;알림마당';
    headerHtml += '</a>';
    headerHtml += '</li>';
    headerHtml += '<li class="nav-item" style="margin-left: 0px;">';
    headerHtml += '<a class="nav-link waves-effect waves-light" href="/admin/gallery_manager">';
    headerHtml += '<i class="far fa-images"></i>&nbsp;&nbsp;갤러리관리';
    headerHtml += '</a>';
    headerHtml += '</li>';
    headerHtml += '<li class="nav-item" style="margin-left: 0px;">';
    headerHtml += '<a class="nav-link waves-effect waves-light" href="/admin/item_manager">';
    headerHtml += '<i class="fab fa-product-hunt"></i>&nbsp;&nbsp;상품관리';
    headerHtml += '</a>';
    headerHtml += '</li>';
    headerHtml += '<li class="nav-item" style="margin-left: 0px;">';
    headerHtml += '<a class="nav-link waves-effect waves-light" href="/admin/order_list">';
    headerHtml += '<i class="far fa-list-ol"></i>&nbsp;&nbsp;주문목록';
    headerHtml += '</a>';
    headerHtml += '</li>';
    headerHtml += '<li class="nav-item" style="margin-left: 0px;">';
    headerHtml += '<a class="nav-link waves-effect waves-light" href="/admin/user_manager">';
    headerHtml += '<i class="far fa-users"></i>&nbsp;&nbsp;회원관리';
    headerHtml += '</a>';
    headerHtml += '</li>';
    headerHtml += '<li class="nav-item" style="margin-left: 0px;">';
    headerHtml += '<a class="nav-link waves-effect waves-light" href="/admin/delivery_manager">';
    headerHtml += '<i class="far fa-truck"></i>&nbsp;&nbsp;배송관리';
    headerHtml += '</a>';
    headerHtml += '</li>';
}
headerHtml += '</ul>';
headerHtml += '</div>';
headerHtml += '</div>';
headerHtml += '</nav>';

$('header').append(headerHtml);

$('#logout').click(function() {
   logout();
});
