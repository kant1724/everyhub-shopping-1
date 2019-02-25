function ajax(url, inputData, gubun, method) {
    $.ajax(url, {
        type: method,
        data: inputData,
        async: false,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function (data, status, xhr) {},
        error: function (jqXhr, textStatus, errorMessage) {}
    });
}

$(document).ready(function() {
    $('#purchase_btn').click(function() {
        let productArr = JSON.parse(localStorage.getItem('product'));
        let text = '';
        for (let i = 0; i < productArr.length; ++i) {
            text += productArr[i].itemNm1;
            text += ' * ';
            text += productArr[i].qty;
            text += ' = ';
            text += Number(productArr[i].priceNum) * Number(productArr[i].qty);
            text += '\n';
        }
        alert(text);
        location.href = '/purchase';
    });
    let productArr = JSON.parse(localStorage.getItem('product'));
    let html = '';
    for (let i = 0; i < productArr.length; ++i) {
        html += '<tr>';
        html += '<input id="id" type="hidden" value="' + productArr[i].id + '">';
        html += '<input id="item_no" type="hidden" value="' + productArr[i].itemNo + '">';
        html += '<td><button type="button" class="btn btn-sm btn-danger remove-item" data-toggle="tooltip" data-placement="top" title="Remove item">X</button></td>';
        html += '<th scope="row"><img src="' + productArr[i].imagePath + '" alt="" class="img-fluid z-depth-0"></th>';
        html += '<td>' + productArr[i].itemNm1 + ' ' + productArr[i].itemNm2 + '</td>';
        html += '<td>' + productArr[i].price + '</td>';
        html += '<td class="text-center text-md-left"><span class="qty">' + productArr[i].qty + '</span>';
        html += '<div class="btn-group radio-group ml-2" data-toggle="buttons">';
        html += '<label class="minus-qty btn btn-sm deep-orange btn-rounded">';
        html += '<input type="radio" name="options" id="option1">&mdash;';
        html += '</label>';
        html += '<label class="plus-qty btn btn-sm deep-orange btn-rounded"><input type="radio" name="options" id="option2">+</label>';
        html += '</div></td><td>' + productArr[i].price + '</td></tr>';
    }
    $('#cart_tbody').append(html);
    $('.remove-item').click(function() {
        let id = $(this).parent().parent().find('#id').val();
        let productArr = JSON.parse(localStorage.getItem('product'));
        for (let i = 0; i < productArr.length; ++i) {
            if (productArr[i].id == id) {
                productArr.splice(i);
            }
        }
        localStorage.setItem('product', JSON.stringify(productArr));
        $(this).parent().parent().remove();
    });
    $('.plus-qty').click(function() {
        let qtyObj = $(this).parent().parent().find('.qty');
        let qty = qtyObj.text();
        let nQty = Number(qty) + 1;
        qtyObj.text(nQty);
        let id = $(this).parent().parent().parent().find('#id').val();
        setQty(id, nQty);
    });
    $('.minus-qty').click(function() {
        let qtyObj = $(this).parent().parent().find('.qty');
        let qty = qtyObj.text();
        if (qty > 0) {
            let nQty = Number(qty) - 1;
            qtyObj.text(nQty);
            let id = $(this).parent().parent().parent().find('#id').val();
            setQty(id, nQty);
        }
    });
});

function setQty(id, qty) {
    let productArr = JSON.parse(localStorage.getItem('product'));
    for (let i = 0; i < productArr.length; ++i) {
        if (productArr[i].id == id) {
            productArr[i].qty = qty;
        }
    }
    localStorage.setItem('product', JSON.stringify(productArr));
}
