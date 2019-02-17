function ajax(url, input_data, gubun, method) {
    $.ajax(url, {
        type: method,
        data: input_data,
        async: false,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {
            if (gubun == 'registerNewProduct') {
                registerNewProductCallback(data.ret);
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

function fileUpload(url, input_data, gubun, method) {
    $.ajax(url, {
        type: method,
        data: input_data,
        enctype: 'multipart/form-data',
        processData: false,
        contentType: false,
        async: true,
        success: function (data, status, xhr) {
            if (gubun == 'uploadImage') {
                uploadImageCallback();
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    $('.file_upload').file_upload();
    $('select').materialSelect();

    $('#product_register_btn').click(function() {
        registerNewProduct();
    });
});

function registerNewProduct() {
    let itemNm1 = $('#itemNm1').val();
    let itemNm2 = $('#itemNm2').val();
    let price = $('#price').val();
    let itemKcd = $('#itemKcd').val();
    let originCd = $('#originCd').val();
    let itemDesc = $('#itemDesc').val();

    let input = {
        'itemNm1' : itemNm1,
        'itemNm2' : itemNm2,
        'price' : price,
        'itemKcd' : itemKcd,
        'originCd' : originCd,
        'itemDesc' : itemDesc
    }

    ajax('/admin/productNew/registerNewProduct', input, 'registerNewProduct', 'POST');
}

function registerNewProductCallback(ret) {
    let formData = new FormData();
    formData.append(ret, $("#item_image")[0].files[0]);
    fileUpload('/admin/productNew/uploadImage', formData, 'uploadImage', 'POST');
}

function uploadImageCallback() {
    alert("상품이 등록되었습니다.");
}
