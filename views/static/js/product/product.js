function ajax(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
        async: false,
        xhrFields: { withCredentials: true },
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {
            if (gubun == 'selectOneItem') {
                selectOneItemCallback(data.ret);
            } else if (gubun == 'selectProductReviews') {
                selectProductReviewsCallback(data.ret);
            } else if (gubun == 'selectQna') {
                selectQnaCallback(data.ret);
            } else if (gubun == 'selectQnaReply') {
                selectQnaReplyCallback(data.ret);
            } else if (gubun == 'writeQna') {
                writeQnaCallback();
            } else if (gubun == 'writeQnaReply') {
                writeQnaReplyCallback();
            } else if (gubun == 'selectItemOption') {
                selectItemOptionCallback(data.ret);
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

function addCart() {
    let productArr = JSON.parse(localStorage.getItem('product'));
    let id = 0;
    if (productArr != null) {
        for (let i = 0; i < productArr.length; ++i) {
            let optionNo = productArr[i].optionNo;
            if ($('#info_option_no').val() == optionNo) {
                return -1;
            }
            id = Math.max(productArr[i].id, id);
        }
    }
    id += 1;
    let p = {
        id: id,
        optionNo: $('#info_option_no').val(),
        optionNm: $('#info_option_nm').val(),
        itemNo: $('#item_no').val(),
        imagePath: $('#info_image_path_1').prop('src'),
        itemNm: $('#info_item_nm').text(),
        keepingMethod: $('#keeping_method').val(),
        damageRemarks: $('#damage_remarks').val(),
        itemPrice: $('#info_item_price').text(),
        shippingFee: $('#info_shipping_fee').text(),
        itemPriceNum: $('#info_item_price_num').val(),
        shippingFeeNum: $('#info_shipping_fee_num').val(),
        qty: $('#qty').val()
    };
    if (localStorage.getItem('product') != null) {
        productArr.push(p);
        localStorage.setItem('product', JSON.stringify(productArr));
    } else {
        let productArr = [p];
        localStorage.setItem('product', JSON.stringify(productArr));
    }

    return id;
}

$(document).ready(function() {
    toastr.options = {
        "timeOut": "1000"
    };
    $('#add_cart').click(function() {
        let res = addCart();
        if (res >= 0) {
            toastr["info"]("상품이 장바구니에 추가되었습니다.")
        } else {
            toastr["info"]("이미 장바구니에 있는 상품입니다. 장바구니에서 수량을 조정하세요.")
        }
    });

    $('#order_now').click(function() {
        let param = 'itemNo=' + encodeURIComponent($('#item_no').val());
        param += '&optionNo=' + encodeURIComponent($('#info_option_no').val());
        param += '&optionNm=' + encodeURIComponent($('#info_option_nm').val());
        param += '&imagePath=' + encodeURIComponent($('#info_image_path_1').prop('src'));
        param += '&itemNm=' + encodeURIComponent($('#info_item_nm').text());
        param += '&keepingMethod=' + encodeURIComponent($('#keeping_method').val());
        param += '&itemPrice=' + encodeURIComponent($('#info_item_price').text());
        param += '&shippingFee=' + encodeURIComponent($('#info_shipping_fee').text());
        param += '&itemPriceNum=' + encodeURIComponent($('#info_item_price_num').val());
        param += '&shippingFeeNum=' + encodeURIComponent($('#info_shipping_fee_num').val());
        param += '&qty=' + encodeURIComponent($('#qty').val());
        if ($('#qty').val() == 0) {
            alert('수량은 1이상이어야 합니다.');
            return;
        }
        location.href = '/purchase?' + param;
    });

    $('.admin-page').click(function() {
        location.href = '/admin/product_manager';
    });

    $('#product_review').click(function() {
        $('#qna_list').hide();
        $('#write_qna').hide();
        $('#review_list').show();
        $('#review_pagination').show();
        $('#qna_pagination').hide();
        $('#menu_selected').css('margin-left', '5px');
    });

    $('#qna').click(function() {
        $('#review_list').hide();
        $('#qna_list').show();
        $('#write_qna').show();
        $('#review_pagination').hide();
        $('#qna_pagination').show();
        $('#menu_selected').css('margin-left', '190px');
    });

    $('#write_qna').click(function() {
        $('#item_no_modal').val($('#item_no').val());
        $('#qna_subject_modal').val('');
        $('#qna_content_modal').val('');
        $('#qna_modal').modal();
    });

    $('.qty-plus-btn').click(function() {
        $('#qty').val(Number($('#qty').val()) + 1);
    });

    $('.qty-minus-btn').click(function() {
        if (Number($('#qty').val()) > 0) {
            $('#qty').val(Number($('#qty').val()) - 1);
        }
    });

    $('#write_qna_btn').click(function() {
        writeQna();
    });

    $('#item_option').change(function() {
        let optionNo = $(this).val();
        for (let i = 0; i < optionData.length; ++i) {
            if (optionData[i].optionNo == optionNo) {
                $('#info_item_price').text(numberWithCommas(optionData[i].itemPrice) + '원');
                $('#info_shipping_fee').text(numberWithCommas(optionData[i].shippingFee) + '원');
                $('#info_item_price_num').val(optionData[i].itemPrice);
                $('#info_shipping_fee_num').val(optionData[i].shippingFee);
                $('#info_option_no').val(optionData[i].optionNo);
                $('#info_option_nm').val(optionData[i].optionNm);
            }
        }
    });

    constructReview.init(selectProductReviews);
    constructQna.init(selectQna, selectQnaReply, writeQnaReply);

    selectOneItem();
    selectItemOption();
    selectProductReviews();
    selectQna();
});

function selectOneItem() {
    let itemNo = $('#item_no').val();
    let inputData  = {
        itemNo: itemNo
    };
    ajax(serverUrl + '/admin/item_manager/selectOneItem', inputData , 'selectOneItem', 'POST');
}

function selectItemOption() {
    let itemNo = $('#item_no').val();
    let inputData = {
        itemNo: itemNo
    };
    ajax(serverUrl + '/admin/item_manager/selectItemOption', inputData, 'selectItemOption', 'POST');
}

let optionData = [];
function selectItemOptionCallback(ret) {
    optionData = ret;
    for (let i = 0; i < ret.length; ++i) {
        let optionNo = ret[i].optionNo;
        let optionNm = ret[i].optionNm;
        let useYn = ret[i].useYn;
        if (useYn == 'N') continue;
        $('#item_option').append('<option value="' + optionNo + '">' + optionNm + '</option>');
    }
    $('#info_item_price').text(numberWithCommas(optionData[0].itemPrice) + '원');
    $('#info_shipping_fee').text(numberWithCommas(optionData[0].shippingFee) + '원');
    $('#info_item_price_num').val(optionData[0].itemPrice);
    $('#info_shipping_fee_num').val(optionData[0].shippingFee);
    $('#info_option_no').val(optionData[0].optionNo);
    $('#info_option_nm').val(optionData[0].optionNm);
}

function selectProductReviews() {
    let itemNo = $('#item_no').val();
    let inputData  = {
        itemNo: itemNo,
        lastReviewNo: constructReview.lastReviewNo,
        limit: constructReview.idPerPage * constructReview.pageLength
    };
    ajax(serverUrl + '/product/selectProductReviews', inputData , 'selectProductReviews', 'POST');
}

function selectQna() {
    let itemNo = $('#item_no').val();
    let inputData  = {
        itemNo: itemNo,
        lastQnaNo: constructQna.lastQnaNo,
        limit: constructQna.idPerPage * constructQna.pageLength
    };
    ajax(serverUrl + '/product/selectQna', inputData , 'selectQna', 'POST');
}

function selectQnaReply(qnaNo) {
    let inputData  = {
        qnaNo: qnaNo
    };
    ajax(serverUrl + '/product/selectQnaReply', inputData , 'selectQnaReply', 'POST');
}

function selectOneItemCallback(ret) {
    let itemNm = ret[0].itemNm;
    if (ret[0].shipYn == 'N') {
        itemNm += '<span class="ml-2" style="color: #980000">(출하전)</span>';
    } else if (ret[0].soldOutYn == 'Y') {
        itemNm += '<span class="ml-2" style="color: #980000">(품절)</span>';
    } else {
        $('#order_now').prop('disabled', false);
        $('#add_cart').prop('disabled', false);
    }
    let html = '';
    let cnt = 1;
    for (let i = 1; i <= 5; ++i) {
        if (!isNull(ret[0]['imagePath' + i])) {
            html += '<div class="swiper-slide">';
            html += '<img id="info_image_path_' + cnt + '" src="' + ret[0]['imagePath' + i] + '" width="400px">';
            html += '</div>';
            cnt += 1;
        }
    }
    $('.swiper-wrapper').append(html);
    initSwiper();
    $('#info_image_path').prop('src', ret[0].imagePath1);
    $('#info_item_nm').html(itemNm);
    $('#info_item_desc').text(ret[0].itemDesc);
    $('#keeping_method').val(ret[0].keepingMethod);
    $('#damage_remarks').val(ret[0].damageRemarks);
}

function initSwiper() {
    let swiper = new Swiper('.swiper-container', {
        autoplay: {
            delay: 5000,
        },
        slidesPerView: 1,
        loop: false,
        pagination: {
            el: '.swiper-pagination',
            clickable: true
        },
        navigation: {
            prevEl: '.swiper-button-prev',
            nextEl: '.swiper-button-next'
        }
    });
}

function writeQna() {
    let itemNo = $('#item_no_modal').val();
    let inputData = {
        subject: $('#qna_subject_modal').val(),
        content: $('#qna_content_modal').val(),
        itemNo: itemNo
    };
    ajax(serverUrl + '/product/writeQna', inputData, 'writeQna', 'POST');
}

function writeQnaReply(qnaNo, content) {
    let inputData = {
        qnaNo: qnaNo,
        content: content
    };
    ajax(serverUrl + '/product/writeQnaReply', inputData, 'writeQnaReply', 'POST');
}

function selectProductReviewsCallback(ret) {
    constructReview.selectCallback(ret)
}

function selectQnaCallback(ret) {
    constructQna.selectCallback(ret)
}

function selectQnaReplyCallback(ret) {
    constructQna.selectReplyCallback(ret)
}

function writeQnaCallback() {
    alert('질문이 등록되었습니다.');
    $('#close_modal').click();
    constructQna.init(selectQna, selectQnaReply, writeQnaReply);
    selectQna();
}

function writeQnaReplyCallback() {
    alert('답글이 등록되었습니다.');
}
