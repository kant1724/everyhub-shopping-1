function ajax(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
        async: false,
        xhrFields: { withCredentials: true },
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {
            if (gubun == 'registerNewItem') {
                registerNewItemCallback(data.ret);
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
        async: false,
        success: function (data, status, xhr) {
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

let image1 = false;
let image2 = false;
let image3 = false;
let image4 = false;
let image5 = false;
let image6 = false;
$(document).ready(function() {
    $('select').materialSelect();

    $('#item_register_btn').click(function() {
        registerNewItem();
    });

    $('#item_image_1').change(function() {
        let file = this.files[0];
        let reader = new FileReader();
        reader.onloadend = function () {
            $('#image_div_1').css('background-image', 'url("' + reader.result + '")');
        };
        if (file) {
            reader.readAsDataURL(file);
        } else {}

        $('#remove_image_1').css('display', 'block');
        image1 = true;
    });

    $('#item_image_2').change(function() {
        let file = this.files[0];
        let reader = new FileReader();
        reader.onloadend = function () {
            $('#image_div_2').css('background-image', 'url("' + reader.result + '")');
        };
        if (file) {
            reader.readAsDataURL(file);
        } else {}

        $('#remove_image_2').css('display', 'block');
        image2 = true;
    });

    $('#item_image_3').change(function() {
        let file = this.files[0];
        let reader = new FileReader();
        reader.onloadend = function () {
            $('#image_div_3').css('background-image', 'url("' + reader.result + '")');
        };
        if (file) {
            reader.readAsDataURL(file);
        } else {}

        $('#remove_image_3').css('display', 'block');
        image3 = true;
    });

    $('#item_image_4').change(function() {
        let file = this.files[0];
        let reader = new FileReader();
        reader.onloadend = function () {
            $('#image_div_4').css('background-image', 'url("' + reader.result + '")');
        };
        if (file) {
            reader.readAsDataURL(file);
        } else {}

        $('#remove_image_4').css('display', 'block');
        image4 = true;
    });

    $('#item_image_5').change(function() {
        let file = this.files[0];
        let reader = new FileReader();
        reader.onloadend = function () {
            $('#image_div_5').css('background-image', 'url("' + reader.result + '")');
        };
        if (file) {
            reader.readAsDataURL(file);
        } else {}

        $('#remove_image_5').css('display', 'block');
        image5 = true;
    });

    $('#item_image_6').change(function() {
        let file = this.files[0];
        let reader = new FileReader();
        reader.onloadend = function () {
            $('#image_div_6').css('background-image', 'url("' + reader.result + '")');
        };
        if (file) {
            reader.readAsDataURL(file);
        } else {}

        $('#remove_image_6').css('display', 'block');
        image6 = true;
    });

    $('#remove_image_1').click(function() {
        $('#image_div_1').css('background-image', '');
        $('#remove_image_1').css('display', 'none');
        image1 = false;
    });
    $('#remove_image_2').click(function() {
        $('#image_div_2').css('background-image', '');
        $('#remove_image_2').css('display', 'none');
        image2 = false;
    });
    $('#remove_image_3').click(function() {
        $('#image_div_3').css('background-image', '');
        $('#remove_image_3').css('display', 'none');
        image3 = false;
    });
    $('#remove_image_4').click(function() {
        $('#image_div_4').css('background-image', '');
        $('#remove_image_4').css('display', 'none');
        image4 = false;
    });
    $('#remove_image_5').click(function() {
        $('#image_div_5').css('background-image', '');
        $('#remove_image_5').css('display', 'none');
        image5 = false;
    });
    $('#remove_image_6').click(function() {
        $('#image_div_6').css('background-image', '');
        $('#remove_image_6').css('display', 'none');
        image6 = false;
    });
});

let remoteUrl = '211.253.9.176:5006';

function checkValidation() {
    let isOk = true;
    if ($('#item_nm').val() == undefined || $('#item_nm').val() == '') {
        $('#item_nm_label').text('상품명을 입력하세요.');
        $('#item_nm_label').css('color', 'red');
        isOk = false;
    } else {
        $('#item_nm_label').text('상품명');
        $('#item_nm_label').css('color', 'gray');
    }

    if ($('#item_desc').val() == undefined || $('#item_desc').val() == '') {
        $('#item_desc_label').text('상품설명을 입력하세요.');
        $('#item_desc_label').css('color', 'red');
        isOk = false;
    } else {
        if ($('#item_desc').val().length > 100) {
            $('#item_desc_label').text('상품설명은 100자를 초과할 수 없습니다.');
            $('#item_desc_label').css('color', 'red');
            isOk = false;
        } else {
            $('#item_desc_label').text('상품설명');
            $('#item_desc_label').css('color', 'gray');
        }
    }

    return isOk;
}

function registerNewItem() {
    if (!checkValidation()) {
        return;
    }
    let itemNo = $('#item_no').val();
    let itemNm = $('#item_nm').val();
    let itemMainCtgrCd = $('#item_main_ctgr_cd').val();
    let itemMidCtgrCd = $('#item_mid_ctgr_cd').val();
    let originCd = $('#origin_cd').val();
    let itemDesc = $('#item_desc').val();
    let notice = $('#notice').val();
    let keepingMethod = $('#keeping_method').val();
    let recommendYn = $('#recommend_yn').val();
    let useYn = $('#use_yn').val();
    let shipYn = $('#ship_yn').val();
    let soldOutYn = $('#sold_out_yn').val();
    let sortOrder = $('#sort_order').val() ? $('#sort_order').val() : 0;
    let damageRemarks = $('#damage_remarks').val();

    let inputData = {
        itemNo: itemNo,
        itemNm: itemNm,
        itemMainCtgrCd: itemMainCtgrCd,
        itemMidCtgrCd: itemMidCtgrCd,
        originCd: originCd,
        itemDesc: itemDesc,
        notice: notice,
        keepingMethod: keepingMethod,
        recommendYn: recommendYn,
        useYn: useYn,
        shipYn: shipYn,
        soldOutYn: soldOutYn,
        remoteUrl: remoteUrl,
        sortOrder: sortOrder,
        damageRemarks: damageRemarks,
        image1: image1,
        image2: image2,
        image3: image3,
        image4: image4,
        image5: image5,
        image6: image6
    };

    ajax('/admin/item_manager/registerNewItem', inputData, 'registerNewItem', 'POST');
}

function registerNewItemCallback(ret) {
    if (image1) {
        let formData = new FormData();
        formData.append(ret + '_1', $("#item_image_1")[0].files[0]);
        fileUpload('http://' + remoteUrl + '/upload_image_from_shopping_1', formData, 'uploadImage', 'POST');
    }
    if (image2) {
        let formData = new FormData();
        formData.append(ret + '_2', $("#item_image_2")[0].files[0]);
        fileUpload('http://' + remoteUrl + '/upload_image_from_shopping_1', formData, 'uploadImage', 'POST');
    }
    if (image3) {
        let formData = new FormData();
        formData.append(ret + '_3', $("#item_image_3")[0].files[0]);
        fileUpload('http://' + remoteUrl + '/upload_image_from_shopping_1', formData, 'uploadImage', 'POST');
    }
    if (image4) {
        let formData = new FormData();
        formData.append(ret + '_4', $("#item_image_4")[0].files[0]);
        fileUpload('http://' + remoteUrl + '/upload_image_from_shopping_1', formData, 'uploadImage', 'POST');
    }
    if (image5) {
        let formData = new FormData();
        formData.append(ret + '_5', $("#item_image_5")[0].files[0]);
        fileUpload('http://' + remoteUrl + '/upload_image_from_shopping_1', formData, 'uploadImage', 'POST');
    }
    if (image6) {
        let formData = new FormData();
        formData.append(ret + '_6', $("#item_image_6")[0].files[0]);
        fileUpload('http://' + remoteUrl + '/upload_image_from_shopping_1', formData, 'uploadImage', 'POST');
    }

    alert('상품이 등록되었습니다.');
    location.href = '/admin/item_manager/';
}

