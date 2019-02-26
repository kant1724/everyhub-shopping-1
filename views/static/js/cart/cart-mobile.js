function ajax(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
        async: false,
        xhrFields: { withCredentials: true },
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {},
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    let productArr = JSON.parse(localStorage.getItem('product'));
    let html = '';
    for (let i = 0; i < productArr.length; ++i) {
        html += '<div class="container text-center">';
        html += '<div class="mt-3 pb-3" style="border: 1px solid #ccc;">';
        html += '<div style="border-bottom: 1px solid #ccc; margin-bottom: 15px; font-weight: 700; background: #FAFAFA;">상품</div>';
        html += '<div class="text-left ml-3" style="margin-bottom: 15px;">';
        html += '<div style="display: inline-block;">';
        html += '<img width="100px" src="' + productArr[i].imagePath + '" alt="" class="img-fluid z-depth-0">';
        html += '</div>';
        html += '<div style="display: inline-block; top: 20px; margin-left: 5px; position: relative;">';
        html += '<a id="item_nm_1" style="margin-left: 20px; font-weight: 700;">' + productArr[i].itemNm1 + '</a>';
        html += '<br>';
        html += '<a id="item_qty" style="margin-left: 20px; font-weight: 700;">' + productArr[i].itemQty + '과</a>';
        html += '<a id="item_kg" style="font-weight: 700;">' + productArr[i].itemKg + 'KG</a>';
        html += '<br>';
        html += '<a style="margin-left: 20px; font-size: 12px;">원산지: 국내산</a>';
        html += '</div>';
        html += '</div>';
        html += '<div style="border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; margin-bottom: 15px; font-weight: 700; background: #FAFAFA;">단가</div>';
        html += '<div id="item_price" style="margin-bottom: 15px;">' + productArr[i].itemPrice + '</div>';
        html += '<div style="border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; margin-bottom: 15px; font-weight: 700; background: #FAFAFA;">수량</div>';
        html += '<div style="margin-bottom: 15px;" class="btn-group radio-group ml-2" data-toggle="buttons">';
        html += '<div class="d-inline-block text-center pb-2">';
        html += '<div class="qty-btn"><i class="far fa-minus"></i></div>';
        html += '<input style="position:relative; top: 2px;" type="number" id="1" value="1" min="1" max="2" />';
        html += '<div class="qty-btn"><i class="far fa-plus"></i></div>';
        html += '</div>';
        html += '</div>';
        html += '<div style="border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; margin-bottom: 15px; font-weight: 700; background: #FAFAFA;">가격</div>';
        html += '<div id="sum" style="margin-bottom: 15px;">18,000원</div>';
        html += '<hr>';
        html += '<button type="button" id="delete_btn" class="btn btn-sm btn-danger btn-rounded delete-btn">삭제</button>';
        html += '</div>';
        html += '</div>';
    }
    $('#cart_list').append(html);
});

function setQty(id, qty) {
    let productArr = JSON.parse(localStorage.getItem('product'));
    for (let i = 0; i < productArr.length; ++i) {
        if (productArr[i].id == id) {
            productArr[i].qty = qty;
        }
    }
    localStorage.setItem('product', JSON.stringify(productArr));
}
