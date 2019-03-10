function ajax(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
        async: false,
        xhrFields: { withCredentials: true },
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {
            if (gubun == 'selectOrderListMain') {
                selectOrderListMainCallback(data.ret);
            } else if (gubun == 'writeReview') {
                writeReviewCallback();
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    $('#search').click(function() {
        selectOrderListMain();
    });
    datepicker.init();
    selectOrderListMain();
});

function selectOrderListMain() {
    let inputData = {
        startOrderDate: $('#startingDate').val(),
        endOrderDate: $('#endingDate').val()
    };
    ajax(serverUrl + '/admin/order_list/selectOrderListMain', inputData, 'selectOrderListMain', 'POST');
}

function selectOrderListMainCallback(ret) {
    let html = '';
    $('#order_list_tbody').empty();
    let rowspan = {};
    for (let i = 0; i < ret.length; ++i) {
        let key = ret[i].orderNo;
        if (rowspan[key] != null) {
            rowspan[key] += 1
        } else {
            rowspan[key] = 1;
        }
    }
    let prevOrderNo = -1;
    for (let i = 0; i < ret.length; ++i) {
        let orderNo = ret[i].orderNo;
        let orderDate = ret[i].orderDate;
        let itemNm1 = ret[i].itemNm1;
        let qty = ret[i].qty;
        let imagePath = ret[i].imagePath;
        let totalPrice = ret[i].totalPrice;
        
        if (orderNo != prevOrderNo) {
            let rs = rowspan[orderNo];
            html += '<tr style="margin-bottom: 0px;">';
            let pt = '15px';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + ';">';
            html += '<div id="order_no" class="order-no">' + orderNo + '</div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + ';">';
            html += '<div id="order_date" class="oreder-date">' + orderDate + '</div>';
            html += '</td>';
            html += '<td style="vertical-align: middle;">';
            html += '<div id="image_path" class="image-path"><img src="' + imagePath + '" width="70" style="border-radius: 5px;"></div>';
            html += '</td>';
            html += '<td style="vertical-align: middle;">';
            html += '<div id="item_nm_1" class="item-nm-1">' + itemNm1 + '</div>';
            html += '</td>';
            html += '<td style="vertical-align: middle;">';
            html += '<div id="qty" class="qty">' + qty + '</div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="total_price" class="total-price">' + numberWithCommas(totalPrice) + '</div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="width: 110px; vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="cancel_order" class="cancel-order"><a class="common-button-1">주문취소</a></div>';
            html += '</td>';
            html += '<td rowspan="' + rs + '" style="width: 110px; vertical-align: middle; padding-top: ' + pt + '">';
            html += '<div id="write_review" class="write-review"><a class="common-button-1">후기작성</a></div>';
            html += '</td>';
            html += '</tr>';
        } else {
            html += '<tr>';
            html += '<td style="vertical-align: middle;">';
            html += '<div id="image_path" class="image-path"><img src="' + imagePath + '" width="70" style="border-radius: 5px;"></div>';
            html += '</td>';
            html += '<td style="vertical-align: middle;">';
            html += '<div id="item_nm_1" class="item-nm-1">' + itemNm1 + '</div>';
            html += '</td>';
            html += '<td style="vertical-align: middle;">';
            html += '<div id="qty" class="qty">' + qty + '</div>';
            html += '</td>';
            html += '</tr>';
        }
        prevOrderNo = orderNo;
    }
    $('#order_list_tbody').append(html);
    $('.cancel-order').unbind();
    $('.cancel-order').click(function() {

    });
    $('.write-review').unbind();
    $('.write-review').click(function() {
        $('#review_modal').modal();
    });
}

function writeReview() {

}

function writeReviewCallback() {

}