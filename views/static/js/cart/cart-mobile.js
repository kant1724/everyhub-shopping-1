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
        let productArr = JSON.parse(localStorage.getItem('product'));
        let text = '';
        let itemObj = $('#cart_list').find('.each-item');
        for (let i = 0; i < itemObj.length; ++i) {
            let checked = $(itemObj[i]).find('.cart-checkbox').is(':checked');
            if (!checked) {
                continue;
            }
            let id = $(itemObj[i]).find('#id').val();
            for (let j = 0; j < productArr.length; ++j) {
                if (id == productArr[j].id) {
                    text += productArr[j].itemNm1;
                    text += ' * ';
                    text += productArr[j].qty;
                    text += ' = ';
                    text += Number(productArr[j].itemPriceNum) * Number(productArr[j].qty);
                    text += '\n';
                    break;
                }
            }
        }
        location.href = '/purchase';
    });


    let productArr = JSON.parse(localStorage.getItem('product'));
    let html = '';
    for (let i = 0; i < productArr.length; ++i) {
        html += '<div class="each-item container text-center">';
        html += '<input id="id" type="hidden" value="' + productArr[i].id + '">';
        html += '<input id="item_price_num" type="hidden" value="' + productArr[i].itemPriceNum + '">';
        html += '<div class="mt-3 pb-3" style="border: 1px solid #ccc;">';
        html += '<div style="border-bottom: 1px solid #ccc; margin-bottom: 15px; font-weight: 700; background: #FAFAFA;">상품</div>';
        html += '<div class="text-left ml-3" style="margin-bottom: 15px;">';
        html += '<div class="text-center custom-control custom-checkbox">';
        html += '<input type="checkbox" class="cart-checkbox custom-control-input" id="cart_check_box' + i + '" checked>';
        html += '<label class="custom-control-label" for="cart_check_box' + i + '"></label>';
        html += '</div>';
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
        html += '<div class="qty-minus-btn mr-1"><i class="far fa-minus"></i></div>';
        html += '<input style="width: 60px; font-size: 12px; text-align: center; position: relative; top: 2px;" type="number" class="qty" id="qty" value="' + productArr[i].qty + '"/>';
        html += '<div class="qty-plus-btn ml-1"><i class="far fa-plus"></i></div>';
        html += '</div>';
        html += '</div>';
        html += '<div style="border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; margin-bottom: 15px; font-weight: 700; background: #FAFAFA;">가격</div>';
        html += '<div id="sum" style="margin-bottom: 15px;">' + numberWithCommas(Number(productArr[i].itemPriceNum) * productArr[i].qty) + '원</div>';
        html += '<hr>';
        html += '<button type="button" class="btn btn-sm btn-danger btn-rounded remove-item">삭제</button>';
        html += '</div>';
        html += '</div>';
    }
    $('#cart_list').append(html);

    $('.remove-item').click(function() {
        let id = $(this).parent().parent().find('#id').val();
        let productArr = JSON.parse(localStorage.getItem('product'));
        for (let i = 0; i < productArr.length; ++i) {
            if (productArr[i].id == id) {
                productArr.splice(i, 1);
                break;
            }
        }
        localStorage.setItem('product', JSON.stringify(productArr));
        $(this).parent().parent().remove();
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
