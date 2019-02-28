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

    selectProductList();
});

function selectProductList() {
    let inputData = {};
    ajax(serverUrl + '/admin/product_manager/selectProductList', inputData, 'selectProductList', 'POST');
}

function selectProductListCallback(ret) {
    let html = '';
    for (let i = 0; i < ret.length; ++i) {
        html += '<div class="each-item col-lg-4 col-md-12 col-12 pt-2">';
        html += '<input type="hidden" id="item_no" value="' + ret[i].itemNo + '">';
        html += '<div class="row py-2 mb-4 hoverable align-items-center">';
        html += '<div class="col-6"><a><img src="' + ret[i].imagePath + '" style="border-radius: 5px; height: 150px;" class="img-fluid"></a></div>';
        html += '<div class="col-6">';
        html += '<a class="pt-5"><strong>' + ret[i].itemNm1 + ' ' + ret[i].itemNm2 + '</strong></a><br>';
        html += '<a class="pt-5" style="font-size: 15px;"><strong>' + ret[i].itemQty + '과 / ' + ret[i].itemKg + 'KG</strong></a>';
        html += '<h6 class="mt-1 h6-responsive font-weight-bold dark-grey-text"><strong>' + numberWithCommas(ret[i].itemPrice) + '원</strong></h6>';
        html += '<a class="all-product-detail-text3">원산지: 국내산</a>';
        html += '</div></div></div>';
    }
    $('#all_item_list').append(html);

    $('.each-item').click(function() {
        let itemNo = $(this).find('#item_no').val();
        location.href = '/product?itemNo=' + itemNo;
    });
}
