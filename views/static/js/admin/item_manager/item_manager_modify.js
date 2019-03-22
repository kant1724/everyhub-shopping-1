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
    $('select').material_select();

    $('#item_modify_btn').click(function() {
        modifyItem();
    });

    $('#item_image').change(function() {
        let file = this.files[0];
        let reader = new FileReader();
        reader.onloadend = function () {
            $('#image_div').css('background-image', 'url("' + reader.result + '")');
        };
        if (file) {
            reader.readAsDataURL(file);
        } else {}
        imageChanged = true;
    });

    selectOneItem();
});

let remoteUrl = '14.63.168.58:5006';
let imageChanged = false;
function selectOneItem() {
    let inputData = {'itemNo' : $('#item_no').val()};
    ajax(serverUrl + '/admin/item_manager/selectOneItem', inputData, 'selectOneItem', 'POST');
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
    let itemNm1 = $('#item_nm_1').val();
    let itemNm2 = $('#item_nm_2').val();
    let itemMainCtgrCd = $('#item_main_ctgr_cd').val();
    let itemMidCtgrCd = $('#item_mid_ctgr_cd').val();
    let originCd = $('#origin_cd').val();
    let itemDesc = $('#item_desc').val();
    let notice = $('#notice').val();
    let keepingMethod = $('#keeping_method').val();
    let recommendYn = $('#recommend_yn').val();
    let inputData = {
        itemNo: itemNo,
        itemNm1: itemNm1,
        itemNm2: itemNm2,
        itemMainCtgrCd: itemMainCtgrCd,
        itemMidCtgrCd: itemMidCtgrCd,
        originCd: originCd,
        itemDesc: itemDesc,
        notice: notice,
        keepingMethod: keepingMethod,
        recommendYn: recommendYn,
        remoteUrl: remoteUrl,
        imageChanged: imageChanged
    };

    ajax(serverUrl + '/admin/item_manager/modifyItem', inputData, 'modifyItem', 'POST');
}

function selectOneItemCallback(ret) {
    let imagePath = ret[0].imagePath;
    $('#image_div').css('background-image', 'url("' + imagePath + '")');
    $('#item_nm_1').focus();
    $('#item_nm_1').val(ret[0].itemNm1);
    $('#item_nm_2').focus();
    $('#item_nm_2').val(ret[0].itemNm2);
    $('#item_main_ctgr_cd').val(ret[0].itemMainCtgrCd);
    $('#item_mid_ctgr_cd').val(ret[0].itemMidCtgrCd);
    $('#recommend_yn').val(ret[0].recommendYn);
    $('#recommend_yn').parent().find('.select-dropdown li:contains("' + ret[0].recommendYn+ '")').trigger('click')

    //$('#item_main_ctgr_cd').parent().find('.select-dropdown li:contains("' + ret[0].itemMainCtgrNm + '")').trigger('click')
    //$('#item_mid_ctgr_cd').parent().find('.select-dropdown li:contains("' + ret[0].itemMidCtgrNm + '")').trigger('click')

    $('#origin_cd').val(ret[0].originCd);
    $('#item_desc').val(ret[0].itemDesc);
    $('#notice').val(ret[0].notice);
    $('#keeping_method').val(ret[0].keepingMethod);
}

function modifyItemCallback(ret) {
    if (imageChanged) {
        let formData = new FormData();
        formData.append(ret, $("#item_image")[0].files[0]);
        fileUpload('http://' + remoteUrl + '/upload_image_from_shopping_1', formData, 'uploadImage', 'POST');
    } else {
        alert('상품이 변경되었습니다.');
        location.href = '/admin/item_manager/';
    }
}

function uploadImageCallback() {
    alert('상품이 변경되었습니다.');
    location.href = '/admin/item_manager/';
}
