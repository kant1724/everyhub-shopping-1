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

let grid_data = [];
$(document).ready(function() {
    $("#container2").jsGrid({
        width: "710px",
        height: "300px",
        filtering: false,
        editing: false,
        inserting: false,
        sorting: false,
        paging: true,
        autoload: true,
        pageSize: 150,
        pageButtonCount: 10,
        rowClick: function(args) {
            let $row = this.rowByItem(args.item);
            $row.children('.jsgrid-cell').css('background-color', '#B2CCFF');
            $row.children('.jsgrid-cell').css('border-color', '#B2CCFF');
            let orderNo = args.item['번호'];
            $("#order_no").val(orderNo);
        },
        data: grid_data,
        fields: [
            { name: "번호", type: "hidden", width: 60, align: "center" },
            { name: "주문자", type: "text", width: 630 },
            { name: "텍스트", type: "text", width: 630 }
        ]
    });

    selectOrderListMain();
});

function selectOrderListMain() {
    let inputData = {};
    ajax(serverUrl + '/admin/order_list/selectOrderListMain', inputData, 'selectOrderListMain', 'POST');
}

function selectOrderListMainCallback(ret) {
    for (let i = 0; i < ret.length; ++i) {
        let orderNo = ret[i].orderNo;
        let orderDate = ret[i].orderDate;
        let totalPrice = ret[i].totalPrice;
    }

}
