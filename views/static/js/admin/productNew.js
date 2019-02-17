function ajax(url, input_data, gubun, method) {
    $.ajax(url, {
        type: method,
        data: input_data,
        enctype: 'multipart/form-data',
        processData: false,
        contentType: false,
        async: true,
        success: function (data, status, xhr) {
            if (gubun == 'registerNewProduct') {
                registerNewProductCallback();
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

    let formData = new FormData();
    formData.append("itemImage", $("#item_image")[0].files[0]);
    formData.append("itemNm1", itemNm1);
    formData.append("itemNm2", itemNm2);
    formData.append("price", price);
    formData.append("itemKcd", itemKcd);
    formData.append("originCd", originCd);
    formData.append("itemDesc", itemDesc);

    ajax('/admin/productNew/registerNewProduct', formData, 'registerNewProduct', 'POST');
}

function registerNewProductCallback() {
    alert("상품이 등록되었습니다.");
}