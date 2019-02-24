function ajax(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
        async: false,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {
            if (gubun == 'modifyProduct') {
                modifyProductCallback(data.ret);
            } else if (gubun == 'selectOneProduct') {
                selectOneProductCallback(data.ret);
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

function fileUpload(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
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
    $('#go_back').on('click', function() {
        window.history.back();
    })

    $('#go_list').on('click', function() {
        window.history.back();
    })

    $('select').materialSelect();

    $('#product_modify_btn').click(function() {
        modifyProduct();
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

    selectOneProduct();
});

let remoteUrl = '14.63.168.58:5006';
let imageChanged = false;
function selectOneProduct() {
    let input = {'itemNo' : $('#item_no').val()};
    ajax(serverUrl + '/admin/productModification/selectOneProduct', input, 'selectOneProduct', 'POST');
}

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

function modifyProduct() {
    if (!checkValidation()) {
        return;
    }

    let itemNo = $('#item_no').val();
    let itemNm1 = $('#item_nm_1').val();
    let itemNm2 = $('#item_nm_2').val();
    let price = $('#price').val();
    let itemKcd = $('#item_kcd').val();
    let originCd = $('#origin_cd').val();
    let itemDesc = $('#item_desc').val();

    let inputData = {
        itemNo: itemNo,
        itemNm1: itemNm1,
        itemNm2: itemNm2,
        price: price,
        itemKcd: itemKcd,
        originCd: originCd,
        itemDesc: itemDesc,
        remoteUrl: remoteUrl,
        imageChanged: imageChanged
    }

    ajax(serverUrl + '/admin/productModification/modifyProduct', inputData, 'modifyProduct', 'POST');
}

function selectOneProductCallback(ret) {
    let imagePath = ret[0].imagePath;
    $('#image_div').css('background-image', 'url("' + imagePath + '")');
    $('#item_nm_1').focus();
    $('#item_nm_1').val(ret[0].itemNm1);
    $('#item_nm_2').focus();
    $('#item_nm_2').val(ret[0].itemNm2);
    $('#item_kcd').val(ret[0].itemKcd);
    $('#origin_cd').val(ret[0].originCd);
    $('#price').focus();
    $('#price').val(ret[0].price);
    $('#item_desc').val(ret[0].itemDesc);
}

function modifyProductCallback(ret) {
    if (imageChanged) {
        let formData = new FormData();
        formData.append(ret, $("#item_image")[0].files[0]);
        fileUpload('http://' + remoteUrl + '/upload_image_from_shopping_1', formData, 'uploadImage', 'POST');
    } else {
        alert("상품이 변경되었습니다.");
        location.href = '/admin'
    }
}

function uploadImageCallback() {
    alert("상품이 변경되었습니다.");
    location.href = '/admin'
}