let constructOrderList =  {
	cur: -1,
	max: 0,
	lastOrderNo: 99999999,
	idPerPage: 15,
	pageLength: 10,
	allData: [],
	selectFunction: null,

	init: function(func) {
		this.selectFunction = func;
	},

	constructOrderList: function(page) {
		let html = '';
		if (this.allData.length == 0) {
			html += '<div class="mb-3" style="font-size: 13px;">상품 리뷰가 존재하지 않습니다.</div>';
			$('#order_list').append(html);
			return;
		}
		$('#order_list_tbody').empty();
		for (let i = page * this.idPerPage; i < Math.min((page + 1) * this.idPerPage, this.allData.length); ++i) {
			let orderNo = this.allData[i].orderNo;
			let orderDate = this.allData[i].orderDate;
			let subject = this.allData[i].subject;
			let content = this.allData[i].content;
			html += '<tr class="each-review" style="margin-bottom: 0px;">';
			html += '<td>';
			html += '<a class="order-no-title"></a><div id="order_no" class="order-no">' + orderNo + '</div>';
			html += '</td>';
			html += '<td>';
			html += '<div class="review-subject" style="text-align: left;">' + subject + '</div>';
			html += '</td>';
			html += '<td>';
			html += '&nbsp;&nbsp;<div id="order_date" class="order-date">' + orderDate + '</div>';
			html += '</td>';
			html += '</tr>';
			html += '<tr class="each-content" id="content' + reviewNo + '" style="display: none;">';
			html += '<td colspan="3">';
			html += '<div style="text-align: left; padding-left: 50px;">' + content + '</div>';
			html += '</td>';
			html += '</tr>';
		}
		this.lastOrderNo = this.allData[this.allData.length - 1].orderNo;
		$('#order_list_tbody').append(html);
		$('.each-order').unbind();
		$('.each-order').click(function () {
			let orderNo = $(this).find('#order_no').text();
			let sub = $(this).parent().find('#content' + orderNo);
			if (sub.css('display') == 'table-row') {
				sub.css('display', 'none');
			} else {
				let all = $(this).parent().find('.each-content');
				all.css('display', 'none');
				sub.css('display', 'table-row');
			}
		});
	},

	constructPagination: function() {
		$('.pagination').empty();
		let html = '<a id="prev_page" href="#">&laquo;</a>';
		for (let i = this.cur * this.pageLength + 1; i < (this.cur + 1) * this.pageLength; ++i) {
			if (i > (this.allData.length - 1) / this.idPerPage + 1) {
				break;
			}
			html += '<a class="page-no" href="#">' + i + '</a>';
		}
		html += '<a id="next_page" href="#">&raquo;</a>';
		$('.pagination').append(html);
		$('.page-no').unbind();
		$('.page-no').click(function () {
			this.constructOrderList(Number($(this).text()) - 1);
		});
		$('#prev_page').click(function () {
			$('#prev_page').unbind();
			if (this.cur > 0) {
				this.cur -= 1;
				this.constructPagination();
				this.constructOrderList(cur * this.pageLength);
			}
		});
		$('#next_page').click(function () {
			$('#next_page').unbind();
			if (this.max == this.cur) {
				this.selectFunction();
			} else {
				this.cur += 1;
				this.constructPagination();
				this.constructOrderList(cur * this.pageLength);
			}
		});
	},

	selectCallback: function(data) {
		if (data.length > 0) {
			for (let i = 0; i < data.length; ++i) {
				this.allData.push(data[i]);
			}
		}
		this.cur += 1;
		this.constructPagination();
		this.constructOrderList(this.cur * this.pageLength);
		this.max = Math.max(this.max, this.cur);
	}
};
