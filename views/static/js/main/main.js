function ajax(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
        async: false,
        xhrFields: { withCredentials: true },
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {
            if (gubun == 'selectItemList') {
                selectItemListCallback(data.ret);
            } else if (gubun == 'selectGalleryList') {
                selectGalleryListCallback(data.ret);
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    $('#title_logo').click(function() {
        location.href = '/';
    });
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

    initSwiper1();
    selectItemList();
    selectGalleryList();
});

function selectItemList() {
    let inputData = {
        useYn: 'Y'
    };
    ajax('/admin/item_manager/selectItemList', inputData, 'selectItemList', 'POST');
}

function selectItemListCallback(ret) {
    setRecommendProduct(ret);
    setAllProduct(ret);
}

function selectGalleryList() {
    let inputData = {};
    ajax('/admin/gallery_manager/selectGalleryList', inputData, 'selectGalleryList', 'POST');
}

let galleryRet;
function selectGalleryListCallback(ret) {
    galleryRet = ret;
    let html = '';
    $('.gallery-top-wrapper').empty();
    $('.gallery-thumbs-wrapper').empty();
    for (key in ret[0]) {
        let url = ret[0][key];
        if (url != '') {
            html += '<div class="swiper-slide gallery-slide" style="padding-top: 100px; padding-bottom: 100px; margin: auto;';
            html += 'background-image: url(\'' + url + '\');"></div>';
        }
    }
    $('.gallery-top-wrapper').append(html);
    $('.gallery-thumbs-wrapper').append(html);

    initSwiper3();

    let text = galleryRet[0]['imageDesc1'];
    $('#image_desc').text(text);

    galleryTop.on('slideChange', function () {
        let imageDesc = 'imageDesc' + (galleryTop.activeIndex + 1);
        let text = galleryRet[0][imageDesc];
        $('#image_desc').text(text);
    });
}

function initSwiper1() {
    let swiper = new Swiper('.swiper-container.top-swiper', {
        autoplay: {
            delay: 5000,
        },
        slidesPerView: 1,
        loop: false,
        pagination: {
            el: '.swiper-pagination.top-swiper',
            clickable: true
        },
        navigation: {
            prevEl: '.swiper-button-prev.top-swiper',
            nextEl: '.swiper-button-next.top-swiper'
        }
    });
}

function initSwiper2() {
    let swiper = new Swiper('.swiper-container.rcm-swiper', {
        slidesPerView: 3,
        spaceBetween: 30,
        loop: false,
        pagination: {
            el: '.swiper-pagination.rcm-swiper',
            clickable: true
        },
        navigation: {
            prevEl: '.swiper-button-prev.rcm-swiper',
            nextEl: '.swiper-button-next.rcm-swiper'
        }
    });
}
let galleryTop;
function initSwiper3() {
    let galleryThumbs = new Swiper('.swiper-container.gallery-thumbs', {
        spaceBetween: 10,
        slidesPerView: 4,
        loop: false,
        freeMode: true,
        loopedSlides: 5, //looped slides should be the same
        watchSlidesVisibility: true,
        watchSlidesProgress: true,
    });
    galleryTop = new Swiper('.swiper-container.gallery-top', {
        spaceBetween: 10,
        loop: false,
        loopedSlides: 5, //looped slides should be the same
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        thumbs: {
            swiper: galleryThumbs,
        },
    });
}

function setRecommendProduct(ret) {
    $('#recommend_product').empty();
    let html = '';
    for (let i = 0; i < ret.length; ++i) {
        if (ret[i].recommendYn == 'N') continue;
        let shipYn = ret[i].shipYn == 'Y' ? '판매중' : '출하전';
        html += '<div class="swiper-slide each-recommend mb-5">';
        html += '<input type="hidden" id="item_no" value="' + ret[i].itemNo + '">';
        html += '<div class="card-outer" style="background: #FFFFFF;">';
        html += '<div class="view overlay">';
        html += '<img src="' + ret[i].imagePath1 + '"style="height: 300px; width: 100%; class="img-fluid">';
        html += '<a>';
        html += '<div class="mask rgba-white-slight"></div>';
        html += '</a>';
        html += '</div>';
        html += '<div class="card-body">';
        html += '<a class="card-title mb-1">';
        html += '<a style="font-size: 16px; font-weight: 700;">' + ret[i].itemNm + '</a>';
        html += '</a><br>';
        html += '<a class="all-product-detail-text3">원산지: 국내산</a><br>';
        html += '<a style="color: #980000; font-size: 13px;">' + shipYn + '</a><br>';
        html += '<hr>';
        html += '<a class="all-product-detail-text3">' + ret[i].itemDesc.replace(/\n/gi, '<br>') +'</a>';
        html += '<div class="row mb-0 mt-3">';
        html += '<a class="ml-3 mb-0 pb-0 mt-1 font-weight-bold" style="font-size: 16px;">';
        html += '<span class="red-text">';
        html += '</span>';
        html += '</a>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
    }
    $('#recommend_product').append(html);

    initSwiper2();

    $('.each-recommend').click(function() {
        let itemNo = $(this).find('#item_no').val();
        location.href = '/product?itemNo=' + itemNo;
    });
}

function setAllProduct(ret) {
    let html = '';
    for (let i = 0; i < ret.length; ++i) {
        let shipYn = ret[i].shipYn == 'Y' ? '판매중' : '출하전';
        html += '<div class="each-item col-lg-4 col-md-12 col-12 pt-2">';
        html += '<input type="hidden" id="item_no" value="' + ret[i].itemNo + '">';
        html += '<div class="row py-2 mb-4 hoverable align-items-center">';
        html += '<div class="col-6"><a><img src="' + ret[i].imagePath1 + '" style="border-radius: 5px; height: 150px;" class="img-fluid"></a></div>';
        html += '<div class="col-6">';
        html += '<a class="pt-5" style="font-size: 16px; font-weight: 700;"><strong>' + ret[i].itemNm + '</strong></a><br>';
        html += '<a class="all-product-detail-text3">원산지: 국내산</a><br>';
        html += '<a style="color: #980000; font-size: 13px;">' + shipYn + '</a>';
        html += '</div></div></div>';
    }
    $('#all_item_list').append(html);

    $('.each-item').click(function() {
        let itemNo = $(this).find('#item_no').val();
        location.href = '/product?itemNo=' + itemNo;
    });
}
