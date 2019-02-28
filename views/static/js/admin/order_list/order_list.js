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
            }
        },
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    selectOrderListMain();
});

function selectOrderListMain() {
    let inputData = {};
    ajax(serverUrl + '/admin/order_list/selectOrderListMain', inputData, 'selectOrderListMain', 'POST');
}

function selectOrderListMainCallback(ret) {
    let html = '';
    for (let i = 0; i < ret.length; ++i) {
        let orderNo = ret[i].orderNo;
        let orderDate = ret[i].orderDate;
        let totalPrice = ret[i].totalPrice;
        html += '<div>';
        html += '<div class="each-order">';
        html += '<a class="order-no-title">No. </a><div id="order_no" class="order-no">' + orderNo + '</div>';
        html += '&nbsp;&nbsp;<div id="order_date" class="order-date">' + orderDate + '</div>';
        html += '<div class="total-price">' + totalPrice + '</div>';
        html += '</div>';
        html += '<div class="each-order-sub mb-3">';
        html += '<div class="order-text">' + orderDate + '</div>';
        html += '</div>';
        html += '<div class="empty-space-1"></div>';
        html += '</div>';
    }
    $('#order_list').append(html);

    $('.each-order').unbind();
    $('.each-order').click(function() {
        let fontWeight = $(this).find('.total-price').css('font-weight');
        if (fontWeight == '700') {
            let obj = $(this).parent();
            obj.find('.each-order-sub').hide();
            obj.find('.empty-space-1').show();
            obj.find('.total-price').css('font-weight', '300');
        } else {
            let obj = $(this).parent();
            obj.find('.each-order-sub').show();
            obj.find('.empty-space-1').hide();
            obj.find('.total-price').css('font-weight', '700');
        }
    });
}
