function logout() {
    location.href = '/user/logout';
}

let headerHtml = '<nav class="top-nav navbar fixed-top navbar-expand-lg navbar-light white">';
if ($('#user_no').val() == 0) {
    headerHtml += '<div class="container" style="padding-left: 20px; padding-right: 25px;">';
    headerHtml += '<div id="go_home"><div class="text-center"><i style="font-size: 16px;" class="fas fa-home"></i></div><div class="text-center" style="font-size: 11px;">홈</div></div>';
    headerHtml += '<div id="go_login"><div class="text-center"><i style="font-size: 16px;" class="far fa-sign-out-alt"></i></div><div class="text-center" style="font-size: 11px;">로그인</div></div>';
    headerHtml += '<div id="go_sign_up"><div class="text-center"><i style="font-size: 16px;" class="far fa-user-plus"></i></div><div class="text-center" style="font-size: 11px;">회원가입</div></div>';
} else {
    headerHtml += '<div class="container" style="padding-left: 20px; padding-right: 25px;">';
    headerHtml += '<div id="go_home"><div class="text-center"><i style="font-size: 16px;" class="fas fa-home"></i></div><div class="text-center" style="font-size: 11px;">홈</div></div>';
    headerHtml += '<div id="go_mypage"><div class="text-center"><i style="font-size: 16px;" class="fas fa-user"></i></div><div class="text-center" style="font-size: 11px;">마이페이지</div></div>';
    headerHtml += '<div id="logout"><div class="text-center"><i style="font-size: 16px;" class="far fa-sign-out-alt"></i></div><div class="text-center" style="font-size: 11px;">로그아웃</div></div>';
}
headerHtml += '<div id="go_shopping_cart"><div class="text-center"><i style="font-size: 16px;" class="far fa-shopping-cart"></i></div><div class="text-center" style="font-size: 11px;">장바구니</div></div>';
headerHtml += '</div>';
headerHtml += '</nav>';
$('header').append(headerHtml);

$('#go_mypage').click(function() {
    location.href = '/mypage';
});

$('#go_login').click(function() {
    location.href = '/user';
});

$('#go_sign_up').click(function() {
    location.href = '/user/sign_up';
});

$('#go_home').click(function() {
    location.href = '/';
});

$('#go_shopping_cart').click(function() {
    location.href = '/cart';
});

$('#logout').click(function() {
    logout();
});

