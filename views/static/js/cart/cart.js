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
       location.href = '/purchase';
    });
    let productArray = JSON.parse(localStorage.getItem('product'));
    let html = '';
    for (let i = 0; i < productArray.length; ++i) {
        html += '<tr>';
        html += '<td><button type="button" class="btn btn-sm btn-danger" data-toggle="tooltip" data-placement="top" title="Remove item">X</button></td>';
        html += '<th scope="row"><img src="' + productArray[i].imagePath + '" alt="" class="img-fluid z-depth-0"></th>';
        html += '<td>' + productArray[i].itemNm1 + ' ' + productArray[i].itemNm2 + '</td>';
        html += '<td>' + productArray[i].price + '</td>';
        html += '<td class="text-center text-md-left"><span class="qty">1</span>';
        html += '<div class="btn-group radio-group ml-2" data-toggle="buttons">';
        html += '<label class="btn btn-sm deep-orange btn-rounded">';
        html += '<input type="radio" name="options" id="option1">&mdash;';
        html += '</label>';
        html += '<label class="btn btn-sm deep-orange btn-rounded"><input type="radio" name="options" id="option2">+</label>';
        html += '</div></td><td>' + productArray[i].price + '</td></tr>';
    }
    $('#cart_tbody').append(html);
});
