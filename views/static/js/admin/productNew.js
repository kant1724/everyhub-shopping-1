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

let imageChanged = false;
$(document).ready(function() {
    $('.file_upload').file_upload();
    $('select').materialSelect();

    $('#product_register_btn').click(function() {
        registerNewProduct();
    });

    $('#item_image').change(function() {
        let file = this.files[0];
        let reader = new FileReader();
        reader.onloadend = function () {
            $('#image_div').css('background-image', 'url("' + reader.result + '")');
        }
        if (file) {
            reader.readAsDataURL(file);
        } else {}

        imageChanged = true;
    });

});

let remoteUrl = '14.63.168.58:5006';

function checkValidation() {
    let isOk = true;
    if ($('#item_nm_1').val() == undefined || $('#item_nm_1').val() == '') {
        $('#item_nm_1_label').text('상품명1을 입력하세요.');
        $('#item_nm_1_label').css('color', 'red');
        isOk = false;
    } else {
        $('#item_nm_1_label').text('상품명1');
        $('#item_nm_1_label').css('color', 'gray');
    }

    if ($('#item_nm_2').val() == undefined || $('#item_nm_2').val() == '') {
        $('#item_nm_2_label').text('상품명2를 입력하세요.');
        $('#item_nm_2_label').css('color', 'red');
        isOk = false;
    } else {
        $('#item_nm_2_label').text('상품명2');
        $('#item_nm_2_label').css('color', 'gray');
    }

    if ($('#price').val() == undefined || $('#price').val() == '') {
        $('#price_label').text('가격을 입력하세요.');
        $('#price_label').css('color', 'red');
        isOk = false;
    } else {
        $('#price_label').text('가격');
        $('#price_label').css('color', 'gray');
    }

    if ($('#item_desc').val() == undefined || $('#item_desc').val() == '') {
        $('#item_desc_label').text('상품설명을 입력하세요.');
        $('#item_desc_label').css('color', 'red');
        isOk = false;
    } else {
        $('#item_desc_label').text('상품설명');
        $('#item_desc_label').css('color', 'gray');
    }

    return isOk;
}

function registerNewProduct() {
    if (!checkValidation()) {
        return;
    }
    let itemNm1 = $('#item_nm_1').val();
    let itemNm2 = $('#item_nm_2').val();
    let price = $('#price').val();
    let itemKcd = $('#item_kcd').val();
    let originCd = $('#origin_cd').val();
    let itemDesc = $('#item_desc').val();

    let input = {
        'itemNm1' : itemNm1,
        'itemNm2' : itemNm2,
        'price' : price,
        'itemKcd' : itemKcd,
        'originCd' : originCd,
        'itemDesc' : itemDesc,
        'remoteUrl' : remoteUrl
    }

    ajax('/admin/productNew/registerNewProduct', input, 'registerNewProduct', 'POST');
}

function registerNewProductCallback(ret) {
    if (imageChanged) {
        let formData = new FormData();
        formData.append(ret, $("#item_image")[0].files[0]);
        fileUpload('http://' + remoteUrl + '/upload_image_from_shopping_1', formData, 'uploadImage', 'POST');
    } else {
        alert("상품이 등록되었습니다.");
    }
}

function uploadImageCallback() {
    alert("상품이 등록되었습니다.");
}
