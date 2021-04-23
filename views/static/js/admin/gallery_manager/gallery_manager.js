function ajax(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
        async: false,
        xhrFields: { withCredentials: true },
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {
            if (gubun == 'modifyGallery') {
                modifyGalleryCallback();
            } else if (gubun == 'selectGalleryList') {
                selectGalleryListCallback(data.ret);
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
let image7 = false;
let image8 = false;
let image9 = false;

$(document).ready(function() {
    $('select').material_select();

    $('#gallery_modify_btn').click(function() {
        modifyGallery();
    });

    $('#gallery_image_1').change(function() {
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

    $('#gallery_image_2').change(function() {
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

    $('#gallery_image_3').change(function() {
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

    $('#gallery_image_4').change(function() {
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

    $('#gallery_image_5').change(function() {
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

    $('#gallery_image_6').change(function() {
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

    $('#gallery_image_7').change(function() {
        let file = this.files[0];
        let reader = new FileReader();
        reader.onloadend = function () {
            $('#image_div_7').css('background-image', 'url("' + reader.result + '")');
        };
        if (file) {
            reader.readAsDataURL(file);
        } else {}

        $('#remove_image_7').css('display', 'block');
        image7 = true;
    });

    $('#gallery_image_8').change(function() {
        let file = this.files[0];
        let reader = new FileReader();
        reader.onloadend = function () {
            $('#image_div_8').css('background-image', 'url("' + reader.result + '")');
        };
        if (file) {
            reader.readAsDataURL(file);
        } else {}

        $('#remove_image_8').css('display', 'block');
        image8 = true;
    });

    $('#gallery_image_9').change(function() {
        let file = this.files[0];
        let reader = new FileReader();
        reader.onloadend = function () {
            $('#image_div_9').css('background-image', 'url("' + reader.result + '")');
        };
        if (file) {
            reader.readAsDataURL(file);
        } else {}

        $('#remove_image_9').css('display', 'block');
        image9 = true;
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
    $('#remove_image_7').click(function() {
        $('#image_div_7').css('background-image', '');
        $('#remove_image_7').css('display', 'none');
        image7 = false;
    });
    $('#remove_image_8').click(function() {
        $('#image_div_8').css('background-image', '');
        $('#remove_image_8').css('display', 'none');
        image8 = false;
    });
    $('#remove_image_9').click(function() {
        $('#image_div_9').css('background-image', '');
        $('#remove_image_9').css('display', 'none');
        image9 = false;
    });

    selectGalleryList();
});

let remoteUrl = '211.253.9.176:5006';
function selectGalleryList() {
    let inputData = {};
    ajax('/admin/gallery_manager/selectGalleryList', inputData, 'selectGalleryList', 'POST');
}

function modifyGallery() {
    let inputData = {
        remoteUrl: remoteUrl,
        image1: image1,
        image2: image2,
        image3: image3,
        image4: image4,
        image5: image5,
        image6: image6,
        image7: image7,
        image8: image8,
        image9: image9
    };

    ajax('/admin/gallery_manager/modifyGallery', inputData, 'modifyGallery', 'POST');
}

function selectGalleryListCallback(ret) {
    let imagePath1 = ret[0].imagePath1;
    let imagePath2 = ret[0].imagePath2;
    let imagePath3 = ret[0].imagePath3;
    let imagePath4 = ret[0].imagePath4;
    let imagePath5 = ret[0].imagePath5;
    let imagePath6 = ret[0].imagePath6;
    let imagePath7 = ret[0].imagePath7;
    let imagePath8 = ret[0].imagePath8;
    let imagePath9 = ret[0].imagePath9;

    if (!isNull(imagePath1)) {
        $('#remove_image_1').css('display', 'block');
    }
    if (!isNull(imagePath2)) {
        $('#remove_image_2').css('display', 'block');
    }
    if (!isNull(imagePath3)) {
        $('#remove_image_3').css('display', 'block');
    }
    if (!isNull(imagePath4)) {
        $('#remove_image_4').css('display', 'block');
    }
    if (!isNull(imagePath5)) {
        $('#remove_image_5').css('display', 'block');
    }
    if (!isNull(imagePath6)) {
        $('#remove_image_6').css('display', 'block');
    }
    if (!isNull(imagePath7)) {
        $('#remove_image_7').css('display', 'block');
    }
    if (!isNull(imagePath8)) {
        $('#remove_image_8').css('display', 'block');
    }
    if (!isNull(imagePath9)) {
        $('#remove_image_9').css('display', 'block');
    }

    $('#image_div_1').css('background-image', 'url("' + imagePath1 + '")');
    $('#image_div_2').css('background-image', 'url("' + imagePath2 + '")');
    $('#image_div_3').css('background-image', 'url("' + imagePath3 + '")');
    $('#image_div_4').css('background-image', 'url("' + imagePath4 + '")');
    $('#image_div_5').css('background-image', 'url("' + imagePath5 + '")');
    $('#image_div_6').css('background-image', 'url("' + imagePath6 + '")');
    $('#image_div_7').css('background-image', 'url("' + imagePath7 + '")');
    $('#image_div_8').css('background-image', 'url("' + imagePath8 + '")');
    $('#image_div_9').css('background-image', 'url("' + imagePath9 + '")');
}

function modifyGalleryCallback() {
    if (image1) {
        let formData = new FormData();
        formData.append('gallery_1', $("#gallery_image_1")[0].files[0]);
        fileUpload('http://' + remoteUrl + '/upload_image_from_shopping_1', formData, 'uploadImage', 'POST');
    }
    if (image2) {
        let formData = new FormData();
        formData.append('gallery_2', $("#gallery_image_2")[0].files[0]);
        fileUpload('http://' + remoteUrl + '/upload_image_from_shopping_1', formData, 'uploadImage', 'POST');
    }
    if (image3) {
        let formData = new FormData();
        formData.append('gallery_3', $("#gallery_image_3")[0].files[0]);
        fileUpload('http://' + remoteUrl + '/upload_image_from_shopping_1', formData, 'uploadImage', 'POST');
    }
    if (image4) {
        let formData = new FormData();
        formData.append('gallery_4', $("#gallery_image_4")[0].files[0]);
        fileUpload('http://' + remoteUrl + '/upload_image_from_shopping_1', formData, 'uploadImage', 'POST');
    }
    if (image5) {
        let formData = new FormData();
        formData.append('gallery_5', $("#gallery_image_5")[0].files[0]);
        fileUpload('http://' + remoteUrl + '/upload_image_from_shopping_1', formData, 'uploadImage', 'POST');
    }
    if (image6) {
        let formData = new FormData();
        formData.append('gallery_6', $("#gallery_image_6")[0].files[0]);
        fileUpload('http://' + remoteUrl + '/upload_image_from_shopping_1', formData, 'uploadImage', 'POST');
    }
    if (image7) {
        let formData = new FormData();
        formData.append('gallery_7', $("#gallery_image_7")[0].files[0]);
        fileUpload('http://' + remoteUrl + '/upload_image_from_shopping_1', formData, 'uploadImage', 'POST');
    }
    if (image8) {
        let formData = new FormData();
        formData.append('gallery_8', $("#gallery_image_8")[0].files[0]);
        fileUpload('http://' + remoteUrl + '/upload_image_from_shopping_1', formData, 'uploadImage', 'POST');
    }
    if (image9) {
        let formData = new FormData();
        formData.append('gallery_9', $("#gallery_image_9")[0].files[0]);
        fileUpload('http://' + remoteUrl + '/upload_image_from_shopping_1', formData, 'uploadImage', 'POST');
    }

    alert('상품이 변경되었습니다.');
}
