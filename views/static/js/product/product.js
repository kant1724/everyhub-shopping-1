function ajax(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
        async: false,
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
        let itemNo = $('#item_no').val();
        let p = {
            itemNo: itemNo,
            imagePath: $('#info_image_path').prop('src'),
            itemNm1: $('#info_item_nm_1').text(),
            price: $('#info_price').text(),
            itemNm2: $('#info_item_nm_2').text()
        }
        if (localStorage.getItem('product') != null) {
            let productArray = JSON.parse(localStorage.getItem('product'));
            productArray.push(p);
            localStorage.setItem('product', JSON.stringify(productArray));
        } else {
            let productArray = [p];
            localStorage.setItem('product', JSON.stringify(productArray));
        }
        location.href = '/cart'
    });
    selectOneProduct();
});

function selectOneProduct() {
    let itemNo = $('#item_no').val();
    let inputData  = {
        itemNo: itemNo
    };
    ajax(serverUrl + '/admin/selectOneProduct', inputData , 'selectOneProduct', 'POST');
}

function selectOneProductCallback(ret) {
    $('#info_image_path').prop('src', ret[0].imagePath);
    $('#info_item_nm_1').text(ret[0].itemNm1);
    $('#info_price').text(numberWithCommas(ret[0].price) + '원');
    $('#info_item_desc').text(ret[0].itemDesc);
    $('#info_item_nm_2').text(ret[0].itemNm2);
}
