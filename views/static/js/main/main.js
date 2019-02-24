function ajax(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
        async: false,
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
    $('.each-item').click(function() {
       location.href = '/product';
    });
    $('.smooth-goto').on('click', function() {
        $('html, body').animate({scrollTop: $(this.hash).offset().top - 60}, 1000);
        return false;
    });
    $('.card-outer').click(function() {
        location.href = '/product';
    });
    selectProductList();
});

function selectProductList() {
    let inputData = {};
    ajax(serverUrl + '/admin/selectProductList', inputData, 'selectProductList', 'POST');
}

function selectProductListCallback(ret) {
    let html = '';
    for (let i = 0; i < ret.length; ++i) {
        html += '<div class="col-lg-4 col-md-12 col-12 pt-2">';
        html += '<div class="row py-2 mb-4 hoverable align-items-center">';
        html += '<div class="col-6"><a><img src="' + ret[i].imagePath + '" style="height: 150px;" class="img-fluid"></a></div>';
        html += '<div class="col-6">';
        html += '<a class="pt-5"><strong>' + ret[i].itemNm1 + ' ' + ret[i].itemNm2 + '</strong></a>';
        html += '<h6 class="h6-responsive font-weight-bold dark-grey-text"><strong>' + numberWithCommas(ret[i].price) + '원</strong></h6>';
        html += '<a class="all-product-detail-text3">원산지: 국내산</a>';
        html += '</div></div></div>';
    }
    $('#all_item_list').append(html);
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
