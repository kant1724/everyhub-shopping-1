function ajax(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
        async: false,
        xhrFields: { withCredentials: true },
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {
            if (gubun == 'selectOneProduct') {
                selectOneProductCallback(data.ret);
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    $('.add-cart').click(function() {
        let productArr = JSON.parse(localStorage.getItem('product'));
        let id = 0;
        if (productArr != null) {
            for (let i = 0; i < productArr.length; ++i) {
                id = Math.max(productArr[i].id, id);
            }
        }
        let itemNo = $('#item_no').val();
        let p = {
            id: id + 1,
            itemNo: itemNo,
            imagePath: $('#info_image_path').prop('src'),
            itemNm1: $('#info_item_nm_1').text(),
            itemQty: $('#info_item_qty').text(),
            itemKg: $('#info_item_kg').text(),
            itemPrice: $('#info_item_price').text(),
            itemPriceNum: $('#info_item_price_num').text(),
            itemNm2: $('#info_item_nm_2').text(),
            qty: $('#qty').val()
        };
        if (localStorage.getItem('product') != null) {
            productArr.push(p);
            localStorage.setItem('product', JSON.stringify(productArr));
        } else {
            let productArr = [p];
            localStorage.setItem('product', JSON.stringify(productArr));
        }
        location.href = '/cart';
    });
    selectOneProduct();

    $('.qty-plus-btn').click(function() {
        let qtyObj = $(this).parent().find('#qty');
        let qty = Number(qtyObj.val());
        qtyObj.val(qty + 1);
    });

    $('.qty-minus-btn').click(function() {
        let qtyObj = $(this).parent().find('#qty');
        let qty = Number(qtyObj.val());
        if (qty > 0) {
            qtyObj.val(qty - 1);
        }
    });
});

function selectOneProduct() {
    let itemNo = $('#item_no').val();
    let inputData  = {
        itemNo: itemNo
    };
    ajax(serverUrl + '/admin/product_manager/selectOneProduct', inputData , 'selectOneProduct', 'POST');
}

function selectOneProductCallback(ret) {
    $('#info_image_path').prop('src', ret[0].imagePath);
    $('#info_item_nm_1').text(ret[0].itemNm1);
    $('#info_item_qty').text(ret[0].itemQty);
    $('#info_item_kg').text(ret[0].itemKg);
    $('#info_item_price').text(numberWithCommas(ret[0].itemPrice) + '원');
    $('#info_item_price_num').text(ret[0].itemPrice);
    $('#info_item_desc').text(ret[0].itemDesc);
    $('#info_item_nm_2').text(ret[0].itemNm2);
}
