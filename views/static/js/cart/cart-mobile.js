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
    $('#purchase_btn').click(function() {
        let items = '';
        let itemObj = $('#cart_list').find('.each-item');
        for (let i = 0; i < itemObj.length; ++i) {
            let checked = $(itemObj[i]).find('.cart-checkbox').is(':checked');
            if (!checked) {
                continue;
            }
            let id = $(itemObj[i]).find('#id').val();
            items += id + ';';
        }
        items = items.substring(0, items.length - 1);
        location.href = '/purchase?items=' + items;
    });

    let productArr = JSON.parse(localStorage.getItem('product'));
    let html = '';
    for (let i = 0; i < productArr.length; ++i) {
        html += '<div class="each-item container text-center" style="border-bottom: 1px solid #ccc;">';
        html += '<input id="id" type="hidden" value="' + productArr[i].id + '">';
        html += '<input id="item_price_num" type="hidden" value="' + productArr[i].itemPriceNum + '">';
        html += '<div class="mt-3 pb-2">';
        html += '<div>';
        html += '<div class="text-left ml-3" style="margin-bottom: -10px;">';
        html += '<div class="mb-3 text-center custom-control custom-checkbox">';
        html += '<input type="checkbox" class="cart-checkbox custom-control-input" id="cart_check_box' + i + '" checked>';
        html += '<label class="custom-control-label" for="cart_check_box' + i + '"></label>';
        html += '</div>';
        html += '<i class="fal fa-times remove-item" style="font-size: 25px; float: right; margin-right: 20px;"></i>';
        html += '</div>';
        html += '<div style="display: inline-block;">';
        html += '<img style="top: -32px; position: relative; border-radius: 5px;" overflow: hidden; width="100px" src="' + productArr[i].imagePath + '" alt="" class="img-fluid z-depth-0">';
        html += '</div>';
        html += '<div style="overflow: hidden; display: inline-block; top: 10px; margin-left: 15px; position: relative;">';
        html += '<a id="item_nm_1" style="font-size: 14px; margin-left: 20px; font-weight: 700;">' + productArr[i].itemNm1 + '</a>';
        html += '<br>';
        html += '<a id="item_qty" style="margin-left: 20px; font-size: 13px;">' + productArr[i].itemQty + '과</a>&nbsp/&nbsp;';
        html += '<a id="item_kg" style="font-size: 13px;">' + productArr[i].itemKg + 'KG</a>';
        html += '<br>';
        html += '<a id="item_price" style="margin-left: 20px; font-size: 12px;">' + productArr[i].itemPrice + '</a>';
        html += '<br>';
        html += '<a style="margin-left: 20px; font-size: 12px;">원산지: 국내산</a>';
        html += '</div>';
        html += '</div>';
        html += '<div style="margin-bottom: 15px;" class="btn-group radio-group ml-2" data-toggle="buttons">';
        html += '<div class="d-inline-block">';
        html += '<div class="qty-minus-btn mr-1"><i class="far fa-minus"></i></div>';
        html += '<input style="width: 60px; font-size: 12px; text-align: center; position: relative; top: 2px;" type="number" class="qty" id="qty" value="' + productArr[i].qty + '"/>';
        html += '<div class="qty-plus-btn ml-1"><i class="far fa-plus"></i></div>';
        html += '</div>';
        html += '</div>';
        html += '<div id="sum" style="margin-bottom: 10px; font-size: 14px; padding-bottom: 15px;">' + numberWithCommas(Number(productArr[i].itemPriceNum) * productArr[i].qty) + '원</div>';
        html += '</div>';
        html += '</div>';
    }

    $('#cart_list').append(html);

    $('.remove-item').click(function() {
        let id = $(this).parent().parent().parent().parent().find('#id').val();
        let productArr = JSON.parse(localStorage.getItem('product'));
        for (let i = 0; i < productArr.length; ++i) {
            if (productArr[i].id == id) {
                productArr.splice(i, 1);
                break;
            }
        }
        localStorage.setItem('product', JSON.stringify(productArr));
        $(this).parent().parent().parent().fadeOut(500, function() {
            $(this).remove();
        });
    });
    $('.qty-plus-btn').click(function() {
        let qtyObj = $(this).parent().parent().find('.qty');
        let qty = qtyObj.val();
        let nQty = Number(qty) + 1;
        qtyObj.val(nQty);
        let id = $(this).parent().parent().parent().parent().find('#id').val();
        setQty(id, nQty);
        let sumObj = $(this).parent().parent().parent().find('#sum');
        let itemPriceNum = $(this).parent().parent().parent().parent().find('#item_price_num').val();
        sumObj.text(numberWithCommas(nQty * Number(itemPriceNum) + '원'));
    });
    $('.qty-minus-btn').click(function() {
        let qtyObj = $(this).parent().parent().find('.qty');
        let qty = qtyObj.val();
        if (qty > 0) {
            let nQty = Number(qty) - 1;
            qtyObj.val(nQty);
            let id = $(this).parent().parent().parent().parent().find('#id').val();
            setQty(id, nQty);
            let sumObj = $(this).parent().parent().parent().find('#sum');
            let itemPriceNum = $(this).parent().parent().parent().parent().find('#item_price_num').val();
            sumObj.text(numberWithCommas(nQty * Number(itemPriceNum) + '원'));
        }
    });
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
