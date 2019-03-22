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
            let itemNo = productArr[i].itemNo;
            if ($('#item_no').val() == itemNo) {
                return -1;
            }
            id = Math.max(productArr[i].id, id);
        }
    }
    id += 1;
    let p = {
        id: id,
        itemNo: $('#item_no').val(),
        imagePath: $('#info_image_path').prop('src'),
        itemNm1: $('#info_item_nm_1').text(),
        itemPrice: $('#info_item_price').text(),
        itemPriceNum: $('#info_item_price_num').text(),
        itemNm2: $('#info_item_nm_2').text(),
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
        let param = 'itemNo=' + $('#item_no').val();
        param += '&imagePath=' + $('#info_image_path').prop('src');
        param += '&itemNm1=' + $('#info_item_nm_1').text();
        param += '&itemPrice=' + $('#info_item_price').text();
        param += '&itemPriceNum=' + $('#info_item_price_num').text();
        param += '&itemNm2=' + $('#info_item_nm_2').text();
        param += '&qty=' + $('#qty').val();
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
        $('#product_review').css('border-bottom', '3px solid #333');
        $('#qna').css('border-bottom', '0px solid #333');
    });

    $('#qna').click(function() {
        $('#review_list').hide();
        $('#qna_list').show();
        $('#write_qna').show();
        $('#review_pagination').hide();
        $('#qna_pagination').show();
        $('#qna').css('border-bottom', '3px solid #333');
        $('#product_review').css('border-bottom', '0px solid #333');
    });

    $('#write_qna').click(function() {
        $('#item_no_modal').val($('#item_no').val());
        $('#qna_subject_modal').val('');
        $('#qna_content_modal').val('');
        $('#qna_modal').modal();
    });

    $('#write_qna_btn').click(function() {
        writeQna();
    });

    constructReview.init(selectProductReviews);
    constructQna.init(selectQna, selectQnaReply, writeQnaReply);

    selectOneItem();
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
    $('#info_image_path').prop('src', ret[0].imagePath);
    $('#info_item_nm_1').text(ret[0].itemNm1);
    $('#info_item_qty').text(ret[0].itemQty);
    $('#info_item_kg').text(ret[0].itemKg);
    $('#info_item_desc').text(ret[0].itemDesc);
    $('#info_item_nm_2').text(ret[0].itemNm2);
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
