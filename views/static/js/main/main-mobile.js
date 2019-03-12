function ajax(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
        async: false,
        xhrFields: { withCredentials: true },
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {
            if (gubun == 'selectProductList') {
                selectProductListCallback(data.ret);
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    $('.smooth-goto').click(function() {
        $('html, body').animate({scrollTop: $(this.hash).offset().top - 60}, 1000);
    });
    $('.card-outer').click(function() {
        location.href = '/product';
    });
    $('#search_icon_div').click(function() {
        let query = $('#search_input').val();
        location.href = '/search_result?query=' + query;
    });
    $("#search_input").keydown(function(key) {
        if (key.keyCode == 13) {
            let query = $('#search_input').val();
            location.href = '/search_result?query=' + query;
        }
    });
    $('.admin-page').click(function() {
        location.href = '/admin/product_manager';
    });

    $('#go_shopping_cart').click(function() {
        location.href = '/cart';
    });

    selectProductList();
});

function initSwiper() {
    let swiper = new Swiper('.swiper-container', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        pagination: {
            el: '.swiper-pagination',
            clickable: true
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        }
    });
}

function selectProductList() {
    let inputData = {};
    ajax(serverUrl + '/admin/product_manager/selectProductList', inputData, 'selectProductList', 'POST');
}

function selectProductListCallback(ret) {
    setRecommendProduct(ret);
    setAllProduct(ret);
}

function setRecommendProduct(ret) {
    $('#recommend_product').empty();
    let html = '';
    for (let i = 0; i < ret.length; ++i) {
        if (ret[i].recommendYn == 'N') continue;
        html += '<div class="swiper-slide each-recommend mb-5">';
        html += '<input type="hidden" id="item_no" value="' + ret[i].itemNo + '">';
        html += '<div class="card-outer" style="background: #FFFFFF;">';
        html += '<div class="view overlay">';
        html += '<img src="' + ret[i].imagePath + '"style="height: 300px; width: 100%;" class="img-fluid" alt="sample image">';
        html += '<a>';
        html += '<div class="mask rgba-white-slight"></div>';
        html += '</a>';
        html += '</div>';
        html += '<div class="card-body">';
        html += '<a class="card-title mb-1">';
        html += '<a style="font-size: 16px; font-weight: 700;">' + ret[i].itemNm1 + '</a>';
        html += '</a><br>';
        html += '<a class="pt-5" style="font-size: 15px;"><strong>' + ret[i].itemQty + '과 / ' + ret[i].itemKg + 'KG</strong></a><br>';
        html += '<a class="all-product-detail-text3">원산지: 국내산</a><br>';
        html += '<hr>';
        html += '<a class="all-product-detail-text3">' + ret[i].itemDesc +'</a>';
        html += '<div class="row mb-0 mt-3">';
        html += '<a class="ml-3 mb-0 pb-0 mt-1 font-weight-bold" style="font-size: 16px;">';
        html += '<span class="red-text">';
        html += '<strong>' + numberWithCommas(ret[i].itemPrice) + '원</strong>';
        html += '</span>';
        html += '</a>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
    }
    $('#recommend_product').append(html);

    initSwiper();

    $('.each-recommend').click(function() {
        let itemNo = $(this).find('#item_no').val();
        location.href = '/product?itemNo=' + itemNo;
    });
}

function setAllProduct(ret) {
    let html = '';
    for (let i = 0; i < ret.length; ++i) {
        html += '<div class="each-item col-lg-4 col-md-6 col-6 pt-2">';
        html += '<input type="hidden" id="item_no" value="' + ret[i].itemNo + '">';
        html += '<div class="row py-2 mb-4 align-items-center">';
        html += '<div class="col-12"><a><img src="' + ret[i].imagePath + '" style="border-radius: 5px; height: 150px;" class="img-fluid"></a></div>';
        html += '<div class="col-12 pt-2 text-center">';
        html += '<a class="pt-3" style="font-size: 14px; font-weight: 700;"><strong>' + ret[i].itemNm1 + ' ' + ret[i].itemNm2 + '</strong></a><br>';
        html += '<a class="pt-3" style="font-size: 13px;"><strong>' + ret[i].itemQty + '과 / ' + ret[i].itemKg + 'KG</strong></a><br>';
        html += '<a class="mt-1 font-weight-bold" style="font-size: 13px;"><strong>' + numberWithCommas(ret[i].itemPrice) + '원</strong></a><br>';
        html += '<a class="all-product-detail-text3" style="font-size: 12px;">원산지: 국내산</a>';
        html += '</div></div></div><hr>';
    }
    $('#all_item_list').append(html);

    $('.each-item').click(function() {
        let itemNo = $(this).find('#item_no').val();
        location.href = '/product?itemNo=' + itemNo;
    });
}
