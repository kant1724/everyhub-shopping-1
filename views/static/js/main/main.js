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

    selectProductList();
});

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
    let cnt = 0;
    for (let i = 0; i < ret.length; ++i) {
        if (ret[i].recommendYn == 'N') continue;
        if (cnt % 3 == 0) {
            html += '<div class="row">';
        }
        html += '<div class="each-recommend col-lg-4 col-md-6 mb-4">';
        html += '<input type="hidden" id="item_no" value="' + ret[i].itemNo + '">';
        html += '<div class="card-outer" style="background: #FFFFFF;">';
        html += '<div class="view overlay">';
        html += '<img src="' + ret[i].imagePath + '"style="height: 300px; width: 100%; class="img-fluid">';
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
        if (cnt % 3 == 2) {
            html += '</div>';
        }
        cnt += 1;
    }
    $('#recommend_product').append(html);

    $('.each-recommend').click(function() {
        let itemNo = $(this).find('#item_no').val();
        location.href = '/product?itemNo=' + itemNo;
    });
}

function setAllProduct(ret) {
    let html = '';
    for (let i = 0; i < ret.length; ++i) {
        html += '<div class="each-item col-lg-4 col-md-12 col-12 pt-2">';
        html += '<input type="hidden" id="item_no" value="' + ret[i].itemNo + '">';
        html += '<div class="row py-2 mb-4 hoverable align-items-center">';
        html += '<div class="col-6"><a><img src="' + ret[i].imagePath + '" style="border-radius: 5px; height: 150px;" class="img-fluid"></a></div>';
        html += '<div class="col-6">';
        html += '<a class="pt-5" style="font-size: 16px; font-weight: 700;"><strong>' + ret[i].itemNm1 + ' ' + ret[i].itemNm2 + '</strong></a><br>';
        html += '<a class="pt-5" style="font-size: 14px;"><strong>' + ret[i].itemQty + '과 / ' + ret[i].itemKg + 'KG</strong></a><br>';
        html += '<a style="font-size: 14px;" class="mt-1 font-weight-bold dark-grey-text"><strong>' + numberWithCommas(ret[i].itemPrice) + '원</strong></a><br>';
        html += '<a class="all-product-detail-text3">원산지: 국내산</a>';
        html += '</div></div></div>';
    }
    $('#all_item_list').append(html);

    $('.each-item').click(function() {
        let itemNo = $(this).find('#item_no').val();
        location.href = '/product?itemNo=' + itemNo;
    });
}
