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
        let itemObj = $('#cart_tbody').find('.each-item');
        for (let i = 0; i < itemObj.length; ++i) {
            let checked = $(itemObj[i]).find('.cart-checkbox').is(':checked');
            if (!checked) {
                continue;
            }
            let id = $(itemObj[i]).find('#id').val();
            let qty = $(itemObj[i]).find('.qty').text();
            if (qty == 0) {
                alert('수량은 1이상이어야 합니다.');
                return;
            }
            items += id + ';';
        }
        if (items == '') {
            alert('구매할 상품을 선택하세요.');
            return;
        }
        items = items.substring(0, items.length - 1);
        location.href = '/purchase?items=' + encodeURIComponent(items);
    });

    let productArr = JSON.parse(localStorage.getItem('product'));
    let html = '';
    if (productArr == null || productArr.length == 0) {
        html += '<tr class="my-3 text-center" style="font-size: 13px;"><td colspan="8">장바구니가 비어있습니다.</td></tr>';
        $('#cart_tbody').append(html);
    } else {
        for (let i = 0; i < productArr.length; ++i) {
            html += '<tr class="each-item">';
            html += '<input id="id" type="hidden" value="' + productArr[i].id + '">';
            html += '<input id="option_no" type="hidden" value="' + productArr[i].optionNo + '">';
            html += '<input id="item_no" type="hidden" value="' + productArr[i].itemNo + '">';
            html += '<input id="item_price_num" type="hidden" value="' + productArr[i].itemPriceNum + '">';
            html += '<input id="shipping_fee_num" type="hidden" value="' + productArr[i].shippingFeeNum + '">';
            html += '<td><div class="custom-control custom-checkbox">';
            html += '<input type="checkbox" class="cart-checkbox custom-control-input" id="cart_check_box' + i + '" checked>';
            html += '<label class="custom-control-label" for="cart_check_box' + i + '"></label>';
            html += '</div></td>';
            html += '<th scope="row"><img style="width: 80px; border-radius: 5px;" src="' + productArr[i].imagePath + '" alt="" class="img-fluid z-depth-0"></th>';
            html += '<td>' + productArr[i].itemNm + '</td>';
            html += '<td>' + productArr[i].optionNm + '</td>';
            html += '<td>' + productArr[i].itemPrice + '</td>';
            html += '<td>' + productArr[i].shippingFee + '</td>';
            html += '<td class="text-center text-md-left"><span class="qty">' + productArr[i].qty + '</span>';
            html += '<div class="btn-group radio-group ml-2" data-toggle="buttons">';
            html += '<label class="minus-qty btn btn-sm deep-orange btn-rounded">';
            html += '<input type="radio" name="options" id="option1">&mdash;';
            html += '</label>';
            html += '<label class="plus-qty btn btn-sm deep-orange btn-rounded"><input type="radio" name="options" id="option2">+</label>';
            html += '</div></td><td id="sum">' + numberWithCommas((Number(productArr[i].itemPriceNum) + Number(productArr[i].shippingFeeNum)) * productArr[i].qty) + '원</td>';
            html += '<td><i class="fal fa-times remove-item" style="font-size: 25px; float: right; margin-right: 20px;"></i></td></tr>';
        }
        $('#cart_tbody').append(html);
        $('.cart-checkbox').click(function() {
            setTotalPrice();
        });
        setTotalPrice();
        $('.remove-item').click(function () {
            let id = $(this).parent().parent().find('#id').val();
            let productArr = JSON.parse(localStorage.getItem('product'));
            for (let i = 0; i < productArr.length; ++i) {
                if (productArr[i].id == id) {
                    productArr.splice(i, 1);
                    break;
                }
            }
            localStorage.setItem('product', JSON.stringify(productArr));
            $(this).parent().parent().fadeOut(500, function() {
                $(this).remove();
                setTotalPrice();
            });
        });
        $('.plus-qty').click(function() {
            let qtyObj = $(this).parent().parent().find('.qty');
            let qty = qtyObj.text();
            let nQty = Number(qty) + 1;
            qtyObj.text(nQty);
            let id = $(this).parent().parent().parent().find('#id').val();
            setQty(id, nQty);
            let sumObj = $(this).parent().parent().parent().find('#sum');
            let itemPriceNum = $(this).parent().parent().parent().find('#item_price_num').val();
            let shippingFeeNum = $(this).parent().parent().parent().find('#shipping_fee_num').val();
            sumObj.text(numberWithCommas(nQty * (Number(itemPriceNum) + Number(shippingFeeNum)) + '원'));
            setTotalPrice();
        });
        $('.minus-qty').click(function() {
            let qtyObj = $(this).parent().parent().find('.qty');
            let qty = qtyObj.text();
            if (qty > 0) {
                let nQty = Number(qty) - 1;
                qtyObj.text(nQty);
                let id = $(this).parent().parent().parent().find('#id').val();
                setQty(id, nQty);
                let sumObj = $(this).parent().parent().parent().find('#sum');
                let itemPriceNum = $(this).parent().parent().parent().find('#item_price_num').val();
                let shippingFeeNum = $(this).parent().parent().parent().find('#shipping_fee_num').val();
                sumObj.text(numberWithCommas(nQty * (Number(itemPriceNum) + Number(shippingFeeNum)) + '원'));
                setTotalPrice();
            }
        });
        $('.admin-page').click(function() {
            location.href = '/admin/product_manager';
        });
    }
});

function setTotalPrice() {
    let itemObj = $('#cart_tbody').find('.each-item');
    let text = '';
    let totalItemPrice = 0;
    let totalShippingFee = 0;
    for (let i = 0; i < itemObj.length; ++i) {
        let checked = $(itemObj[i]).find('.cart-checkbox').is(':checked');
        if (!checked) {
            continue;
        }
        let itemPriceNum = $(itemObj[i]).find('#item_price_num').val();
        let shippingFeeNum = $(itemObj[i]).find('#shipping_fee_num').val();
        let qty = $(itemObj[i]).find('.qty').text();
        totalItemPrice += Number(itemPriceNum) * Number(qty);
        totalShippingFee += Number(shippingFeeNum) * Number(qty);
    }
    text += '<span style="float: right;">가격: ' + numberWithCommas(totalItemPrice) + '원</span><br>';
    text += '<span style="float: right;">+ 배송비: ' + numberWithCommas(totalShippingFee) + '원</span><br>';
    text += '<span style="float: right;">= ' + numberWithCommas(totalItemPrice + totalShippingFee) + '원</span>';
    $('#totalPrice').html(text);
}

function setQty(id, qty) {
    let productArr = JSON.parse(localStorage.getItem('product'));
    for (let i = 0; i < productArr.length; ++i) {
        if (productArr[i].id == id) {
            productArr[i].qty = qty;
        }
    }
    localStorage.setItem('product', JSON.stringify(productArr));
}
