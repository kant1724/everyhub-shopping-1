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
    $('select').materialSelect();

    $('#item_register_btn').click(function() {
        registerNewItem();
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
        imageChanged: imageChanged
    };

    ajax(serverUrl + '/admin/item_manager/registerNewItem', inputData, 'registerNewItem', 'POST');
}

function registerNewItemCallback(ret) {
    if (imageChanged) {
        let formData = new FormData();
        formData.append(ret, $("#item_image")[0].files[0]);
        fileUpload('http://' + remoteUrl + '/upload_image_from_shopping_1', formData, 'uploadImage', 'POST');
    } else {
        alert('상품이 등록되었습니다.');
        location.href = '/admin/item_manager/';
    }
}

function uploadImageCallback() {
    alert('상품이 등록되었습니다.');
    location.href = '/admin/item_manager/';
}
