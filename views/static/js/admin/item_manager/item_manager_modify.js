function ajax(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
        async: false,
        xhrFields: { withCredentials: true },
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {
            if (gubun == 'modifyItem') {
                modifyItemCallback(data.ret);
            } else if (gubun == 'selectOneItem') {
                selectOneItemCallback(data.ret);
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
    $('select').material_select();

    $('#item_modify_btn').click(function() {
        modifyItem();
    });

    $('#item_image_1').change(function() {
        let file = this.files[0];
        let reader = new FileReader();
        reader.onloadend = function () {
            $('#image_div_1').css('background-image', 'url("' + reader.result + '")');
        }
        if (file) {
            reader.readAsDataURL(file);
        } else {}

        image1 = true;
    });

    $('#item_image_2').change(function() {
        let file = this.files[0];
        let reader = new FileReader();
        reader.onloadend = function () {
            $('#image_div_2').css('background-image', 'url("' + reader.result + '")');
        }
        if (file) {
            reader.readAsDataURL(file);
        } else {}

        image2 = true;
    });

    $('#item_image_3').change(function() {
        let file = this.files[0];
        let reader = new FileReader();
        reader.onloadend = function () {
            $('#image_div_3').css('background-image', 'url("' + reader.result + '")');
        }
        if (file) {
            reader.readAsDataURL(file);
        } else {}

        image3 = true;
    });

    $('#item_image_4').change(function() {
        let file = this.files[0];
        let reader = new FileReader();
        reader.onloadend = function () {
            $('#image_div_4').css('background-image', 'url("' + reader.result + '")');
        }
        if (file) {
            reader.readAsDataURL(file);
        } else {}

        image4 = true;
    });

    $('#item_image_5').change(function() {
        let file = this.files[0];
        let reader = new FileReader();
        reader.onloadend = function () {
            $('#image_div_5').css('background-image', 'url("' + reader.result + '")');
        }
        if (file) {
            reader.readAsDataURL(file);
        } else {}

        image5 = true;
    });

    $('#item_image_6').change(function() {
        let file = this.files[0];
        let reader = new FileReader();
        reader.onloadend = function () {
            $('#image_div_6').css('background-image', 'url("' + reader.result + '")');
        }
        if (file) {
            reader.readAsDataURL(file);
        } else {}

        image6 = true;
    });

    selectOneItem();
});

let remoteUrl = '14.63.174.25:5006';
let imageChanged = false;
function selectOneItem() {
    let inputData = {'itemNo' : $('#item_no').val()};
    ajax(serverUrl + '/admin/item_manager/selectOneItem', inputData, 'selectOneItem', 'POST');
}

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
        if ($('#item_desc').val().length > 60) {
            $('#item_desc_label').text('상품설명은 60자를 초과할 수 없습니다.');
            $('#item_desc_label').css('color', 'red');
            isOk = false;
        } else {
            $('#item_desc_label').text('상품설명');
            $('#item_desc_label').css('color', 'gray');
        }
    }

    return isOk;
}

function modifyItem() {
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
    let sortOrder = $('#sort_order').val();

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
        image1: image1,
        image2: image2,
        image3: image3,
        image4: image4,
        image5: image5,
        image6: image6
    };

    ajax(serverUrl + '/admin/item_manager/modifyItem', inputData, 'modifyItem', 'POST');
}

function selectOneItemCallback(ret) {
    let imagePath1 = ret[0].imagePath1;
    let imagePath2 = ret[0].imagePath2;
    let imagePath3 = ret[0].imagePath3;
    let imagePath4 = ret[0].imagePath4;
    let imagePath5 = ret[0].imagePath5;
    let imagePath6 = ret[0].imagePath6;
    if (imagePath1 != '') image1 = true;
    if (imagePath2 != '') image2 = true;
    if (imagePath3 != '') image3 = true;
    if (imagePath4 != '') image4 = true;
    if (imagePath5 != '') image5 = true;
    if (imagePath6 != '') image6 = true;

    $('#image_div_1').css('background-image', 'url("' + imagePath1 + '")');
    $('#image_div_2').css('background-image', 'url("' + imagePath2 + '")');
    $('#image_div_3').css('background-image', 'url("' + imagePath3 + '")');
    $('#image_div_4').css('background-image', 'url("' + imagePath4 + '")');
    $('#image_div_5').css('background-image', 'url("' + imagePath5 + '")');
    $('#image_div_6').css('background-image', 'url("' + imagePath6 + '")');

    $('#item_nm').focus();
    $('#item_nm').val(ret[0].itemNm);
    $('#item_main_ctgr_cd').val(ret[0].itemMainCtgrCd);
    $('#item_mid_ctgr_cd').val(ret[0].itemMidCtgrCd);
    $('#use_yn').val(ret[0].useYn);
    $('#ship_yn').val(ret[0].shipYn);
    $('#sold_out_yn').val(ret[0].soldOutYn);
    $('#recommend_yn').val(ret[0].recommendYn);
    $('#origin_cd').val(ret[0].originCd);
    $('#item_desc').val(ret[0].itemDesc);
    $('#notice').val(ret[0].notice);
    $('#keeping_method').val(ret[0].keepingMethod);
    $('#sort_order').focus();
    $('#sort_order').val(ret[0].sortOrder);
}

function modifyItemCallback(ret) {
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

    alert('상품이 변경되었습니다.');
    location.href = '/admin/item_manager/';
}
