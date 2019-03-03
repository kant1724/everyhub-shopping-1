function constructReviewList(ret) {
	let html = '';
	if (ret.length == 0) {
		html += '<div class="mb-3">상품 리뷰가 존재하지 않습니다.</div>';
		$('#review_list').append(html);
		return;
	}
	for (let i = 0; i < ret.length; ++i) {
		let reviewNo = ret[i].reviewNo;
		let reviewDate = ret[i].reviewDate;
		let subject = ret[i].subject;
		let content = ret[i].content;
		html += '<div>';
		html += '<div class="each-review text-left">';
		html += '<a class="review-no-title">No. </a><div id="review_no" class="review-no">' + reviewNo + '</div>';
		html += '&nbsp;&nbsp;<div id="review_date" class="review-date">' + reviewDate + '</div>';
		html += '<div class="review-subject">' + subject + '</div>';
		html += '</div>';
		html += '<div class="each-review-sub my-3 text-left">';
		html += '<div class="review-text">' + content + '</div>';
		html += '</div>';
		html += '<div class="empty-space-1"></div>';
		html += '</div>';
	}
	$('#review_list').append(html);
	$('.each-review').unbind();
	$('.each-review').click(function() {
		let fontWeight = $(this).find('.review-subject').css('font-weight');
		if (fontWeight == '700') {
			let obj = $(this).parent();
			obj.find('.each-review-sub').hide();
			obj.find('.empty-space-1').show();
			obj.find('.review-subject').css('font-weight', '300');
		} else {
			let obj = $(this).parent();
			obj.find('.each-review-sub').show();
			obj.find('.empty-space-1').hide();
			obj.find('.review-subject').css('font-weight', '700');
		}
	});
}
