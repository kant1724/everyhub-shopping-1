function constructReviewList(ret) {
	let html = '';
	if (ret.length == 0) {
		html += '<div class="mb-3" style="font-size: 13px;">상품 리뷰가 존재하지 않습니다.</div>';
		$('#review_list').append(html);
		return;
	}
	for (let i = 0; i < ret.length; ++i) {
		let reviewNo = ret[i].reviewNo;
		let reviewDate = ret[i].reviewDate;
		let subject = ret[i].subject;
		let content = ret[i].content;
		html += '<tr class="each-review" style="margin-bottom: 0px;">';
		html += '<td>';
		html += '<a class="review-no-title"></a><div id="review_no" class="review-no">' + reviewNo + '</div>';
		html += '</td>';
		html += '<td>';
		html += '&nbsp;&nbsp;<div id="review_date" class="review-date">' + reviewDate + '</div>';
		html += '</td>';
		html += '<td>';
		html += '<div class="review-subject">' + subject + '</div>';
		html += '</td>';
		html += '</tr>';
		html += '<tr id="content' + reviewNo + '" style="display: none;">';
		html += '<td colspan="3">';
		html += '<div style="text-align: left; padding: 20px;">' + content+ '</div>';
		html += '</td>';
		html += '</tr>';
	}

	$('#review_list_tbody').append(html);
	$('.each-review').unbind();
	$('.each-review').click(function() {
		let reviewNo = $(this).find('#review_no').text();
		let sub = $(this).parent().find('#content' + reviewNo);
		if (sub.css('display') == 'table-row') {
			sub.css('display', 'none');
		} else {
			sub.css('display', 'table-row');
		}
	});
}
