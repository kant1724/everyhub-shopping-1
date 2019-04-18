let constructReview =  {
	cur: -1,
	max: 0,
	lastReviewNo: 99999999,
	idPerPage: 15,
	pageLength: 10,
	allData: [],
	selectFunction: null,

	init: function(func) {
		this.cur = -1;
		this.max = 0;
		this.lastReviewNo = 99999999;
		this.idPerPage = 15;
		this.pageLength = 10;
		this.allData = [];
		this.selectFunction = func;
	},

	constructReviewList: function(page) {
		let html = '';
		if (this.allData.length == 0) {
			html += '<tr class="my-3" style="font-size: 13px;"><td colspan="3">상품 리뷰가 존재하지 않습니다.</td></tr>';
			$('#review_list').append(html);
			return;
		}
		$('#review_list_tbody').empty();
		for (let i = page * this.idPerPage; i < Math.min((page + 1) * this.idPerPage, this.allData.length); ++i) {
			let reviewNo = this.allData[i].reviewNo;
			let reviewDate = this.allData[i].reviewDate;
			let subject = this.allData[i].subject;
			let content = this.allData[i].content;
			let star = this.allData[i].star;
			let starValue = '';
			for (let j = 0; j < star; ++j) {
				starValue += '<i class="fas fa-star" style="color: #DBC000;"></i>';
			}
			html += '<tr class="each-review" style="margin-bottom: 0px;">';
			html += '<input type="hidden" id="review_no" class="review-no" value="' + reviewNo + '">';
			html += '<td>';
			html += '<div id="review_subject" class="review-subject" style="text-align: left;">' + subject + '</div>';
			html += '</td>';
			html += '<td>';
			html += '<div id="review_date" class="review-date">' + reviewDate + '</div>';
			html += '</td>';
			html += '</tr>';
			html += '<tr class="each-review-content" id="review_content' + reviewNo + '" style="display: none;">';html += '<td colspan="3">';
			html += '<div style="text-align: left; padding-left: 10px; font-size: 11px;">별점:&nbsp;&nbsp;' + starValue + '</div>';
			html += '<div style="text-align: left; padding-left: 10px; font-size: 13px; padding-top: 15px;">' + content + '</div>';
			html += '</td>';
			html += '</tr>';
		}
		this.lastReviewNo = this.allData[this.allData.length - 1].reviewNo;
		$('#review_list_tbody').append(html);
		$('.each-review').unbind();
		$('.each-review').click(function () {
			let reviewNo = $(this).find('#review_no').val();
			let sub = $(this).parent().find('#review_content' + reviewNo);
			if (sub.css('display') == 'table-row') {
				$(this).find('#review_subject').css('font-weight', '300');
				sub.css('display', 'none');
			} else {
				$('.review-subject').css('font-weight', '300');
				$(this).find('#review_subject').css('font-weight', '700');
				let all = $(this).parent().find('.each-review-content');
				all.css('display', 'none');
				sub.css('display', 'table-row');
			}
		});
	},

	constructPagination: function() {
		$('.review-pagination').empty();
		let html = '<a id="review_prev_page">&laquo;</a>';
		for (let i = this.cur * this.pageLength + 1; i <= (this.cur + 1) * this.pageLength; ++i) {
			if (i > Math.floor((this.allData.length - 1) / this.idPerPage) + 1) {
				break;
			}
			if (i == this.cur * this.pageLength + 1) {
				html += '<a class="review-page-no active">' + i + '</a>';
			} else {
				html += '<a class="review-page-no">' + i + '</a>';
			}
		}
		html += '<a id="review_next_page">&raquo;</a>';
		$('.review-pagination').append(html);
		$('.review-page-no').unbind();
		$('.review-page-no').click(function() {
			$('.review-page-no').prop('class', 'review-page-no');
			$(this).prop('class', 'review-page-no active');
			constructReview.constructReviewList(Number($(this).text()) - 1);
		});
		$('#review_prev_page').click(function() {
			$('#review_prev_page').unbind();
			if (constructReview.cur > 0) {
				constructReview.cur -= 1;
				constructReview.constructPagination();
				constructReview.constructReviewList(constructReview.cur * constructReview.pageLength);
			}
		});
		$('#review_next_page').click(function() {
			$('#review_next_page').unbind();
			if (constructReview.max == constructReview.cur) {
				constructReview.selectFunction();
			} else {
				constructReview.cur += 1;
				constructReview.constructPagination();
				constructReview.constructReviewList(constructReview.cur * constructReview.pageLength);
			}
		});
	},

	selectCallback: function(data) {
		if (data.length > 0) {
			for (let i = 0; i < data.length; ++i) {
				this.allData.push(data[i]);
			}
			this.cur += 1;
			this.constructPagination();
			this.constructReviewList(this.cur * this.pageLength);
			this.max = Math.max(this.max, this.cur);
		}
	}
};

let constructReviewMobile =  {
	cur: -1,
	max: 0,
	lastReviewNo: 99999999,
	idPerPage: 15,
	pageLength: 10,
	allData: [],
	selectFunction: null,

	init: function(func) {
		this.cur = -1;
		this.max = 0;
		this.lastReviewNo = 99999999;
		this.idPerPage = 15;
		this.pageLength = 10;
		this.allData = [];
		this.selectFunction = func;
	},

	constructReviewList: function(page) {
		let html = '';
		if (this.allData.length == 0) {
			html += '<tr colspan="2" class="my-3 text-center" style="font-size: 13px;"><td colspan="2">상품 리뷰가 존재하지 않습니다.</td></tr>';
			$('#review_list').append(html);
			return;
		}
		$('#review_list_tbody').empty();
		for (let i = page * this.idPerPage; i < Math.min((page + 1) * this.idPerPage, this.allData.length); ++i) {
			let reviewNo = this.allData[i].reviewNo;
			let reviewDate = this.allData[i].reviewDate;
			let subject = this.allData[i].subject;
			let content = this.allData[i].content;
			let star = this.allData[i].star;
			let starValue = '';
			for (let j = 0; j < star; ++j) {
				starValue += '<i class="fas fa-star" style="color: #DBC000;"></i>';
			}
			html += '<tr class="each-review" style="margin-bottom: 0px;">';
			html += '<input type="hidden" id="review_no" class="review-no" value="' + reviewNo + '">';
			html += '<td>';
			html += '<div id="review_subject" class="review-subject">' + subject + '</div>';
			html += '</td>';
			html += '<td>';
			html += '<div id="review_date" class="review-date">' + reviewDate + '</div>';
			html += '</td>';
			html += '</tr>';
			html += '<tr class="each-content" id="content' + reviewNo + '" style="display: none;">';
			html += '<td colspan="2">';
			html += '<div style="text-align: left; padding-left: 10px; font-size: 11px;">별점:&nbsp;&nbsp;' + starValue + '</div>';
			html += '<div style="text-align: left; padding-left: 10px; padding-top: 10px; font-size: 13px;">' + content + '</div>';
			html += '</td>';
			html += '</tr>';
		}
		this.lastReviewNo = this.allData[this.allData.length - 1].reviewNo;
		$('#review_list_tbody').append(html);
		$('.each-review').unbind();
		$('.each-review').click(function () {
			let reviewNo = $(this).find('#review_no').val();
			let sub = $(this).parent().find('#content' + reviewNo);
			if (sub.css('display') == 'table-row') {
				$(this).find('#review_subject').css('font-weight', '300');
				sub.css('display', 'none');
			} else {
				$('.review-subject').css('font-weight', '300');
				$(this).find('#review_subject').css('font-weight', '700');
				let all = $(this).parent().find('.each-content');
				all.css('display', 'none');
				sub.css('display', 'table-row');
			}
		});
	},

	constructPagination: function() {
		$('.review-pagination').empty();
		let html = '<a id="review_prev_page">&laquo;</a>';
		for (let i = this.cur * this.pageLength + 1; i <= (this.cur + 1) * this.pageLength; ++i) {
			if (i > Math.floor((this.allData.length - 1) / this.idPerPage) + 1) {
				break;
			}
			if (i == this.cur * this.pageLength + 1) {
				html += '<a class="review-page-no active">' + i + '</a>';
			} else {
				html += '<a class="review-page-no">' + i + '</a>';
			}
		}
		html += '<a id="review_next_page">&raquo;</a>';
		$('.review-pagination').append(html);
		$('.review-page-no').unbind();
		$('.review-page-no').click(function () {
			$('.review-page-no').prop('class', 'review-page-no');
			$(this).prop('class', 'review-page-no active');
			constructReviewMobile.constructReviewList(Number($(this).text()) - 1);
		});
		$('#review_prev_page').click(function () {
			$('#review_prev_page').unbind();
			if (constructReviewMobile.cur > 0) {
				constructReviewMobile.cur -= 1;
				constructReviewMobile.constructPagination();
				constructReviewMobile.constructReviewList(constructReviewMobile.cur * constructReviewMobile.pageLength);
			}
		});
		$('#review_next_page').click(function () {
			$('#review_next_page').unbind();
			if (constructReviewMobile.max == constructReviewMobile.cur) {
				constructReviewMobile.selectFunction();
			} else {
				constructReviewMobile.cur += 1;
				constructReviewMobile.constructPagination();
				constructReviewMobile.constructReviewList(constructReviewMobile.cur * constructReviewMobile.pageLength);
			}
		});
	},

	selectCallback: function(data) {
		if (data.length > 0) {
			for (let i = 0; i < data.length; ++i) {
				this.allData.push(data[i]);
			}
			this.cur += 1;
			this.constructPagination();
			this.constructReviewList(this.cur * this.pageLength);
			this.max = Math.max(this.max, this.cur);
		}
	}
};
