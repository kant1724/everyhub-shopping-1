let constructQna =  {
	cur: -1,
	max: 0,
	lastQnaNo: 99999999,
	idPerPage: 5,
	pageLength: 10,
	allData: [],
	selectFunction: null,

	init: function(func) {
		this.cur = -1;
		this.max = 0;
		this.lastQnaNo = 99999999;
		this.idPerPage = 5;
		this.pageLength = 10;
		this.allData = [];
		this.selectFunction = func;
	},

	constructQnaList: function(page) {
		let html = '';
		if (this.allData.length == 0) {
			html += '<tr class="my-3" style="font-size: 13px;"><td colspan="3">Q&A가 존재하지 않습니다.</td></tr>';
			$('#qna_list').append(html);
			return;
		}
		$('#qna_list_tbody').empty();
		for (let i = page * this.idPerPage; i < Math.min((page + 1) * this.idPerPage, this.allData.length); ++i) {
			let qnaNo = this.allData[i].qnaNo;
			let qnaDate = this.allData[i].qnaDate;
			let subject = this.allData[i].subject;
			let content = this.allData[i].content;
			html += '<tr class="each-qna" style="margin-bottom: 0px;">';
			html += '<input type="hidden" id="qna_no" class="qna-no" value="' + qnaNo + '">';
			html += '<td>';
			html += '<div id="qna_subject" class="qna-subject" style="text-align: left;">' + subject + '</div>';
			html += '</td>';
			html += '<td>';
			html += '<div id="qna_date" class="qna-date">' + qnaDate + '</div>';
			html += '</td>';
			html += '</tr>';
			html += '<tr class="each-qna-content" id="qna_content' + qnaNo + '" style="display: none;">';html += '<td colspan="3">';
			html += '<div style="text-align: left; padding-left: 10px; font-size: 13px; padding-top: 15px;">' + content + '</div>';
			html += '</td>';
			html += '</tr>';
		}
		this.lastQnaNo = this.allData[this.allData.length - 1].reviewNo;
		$('#qna_list_tbody').append(html);
		$('.each-qna').unbind();
		$('.each-qna').click(function () {
			let qnaNo = $(this).find('#qna_no').val();
			let sub = $(this).parent().find('#qna_content' + qnaNo);
			if (sub.css('display') == 'table-row') {
				sub.css('display', 'none');
			} else {
				let all = $(this).parent().find('.each-qna-content');
				all.css('display', 'none');
				sub.css('display', 'table-row');
			}
		});
	},

	constructPagination: function() {
		$('.pagination').empty();
		let html = '<a id="prev_page" href="#">&laquo;</a>';
		for (let i = this.cur * this.pageLength + 1; i < (this.cur + 1) * this.pageLength; ++i) {
			if (i > Math.floor((this.allData.length - 1) / this.idPerPage) + 1) {
				break;
			}
			html += '<a class="page-no" href="#">' + i + '</a>';
		}
		html += '<a id="next_page" href="#">&raquo;</a>';
		$('.pagination').append(html);
		$('.page-no').unbind();
		$('.page-no').click(function () {
			constructQna.constructQnaList(Number($(this).text()) - 1);
		});
		$('#prev_page').click(function () {
			$('#prev_page').unbind();
			if (constructQna.cur > 0) {
				constructQna.cur -= 1;
				constructQna.constructPagination();
				constructQna.constructQnaList(cur * constructQna.pageLength);
			}
		});
		$('#next_page').click(function () {
			$('#next_page').unbind();
			if (constructQna.max == constructQna.cur) {
				constructQna.selectFunction();
			} else {
				constructQna.cur += 1;
				constructQna.constructPagination();
				constructQna.constructQnaList(cur * constructQna.pageLength);
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
		this.constructQnaList(this.cur * this.pageLength);
		this.max = Math.max(this.max, this.cur);
	}
};

let constructQnaMobile =  {
	cur: -1,
	max: 0,
	lastQnaNo: 99999999,
	idPerPage: 5,
	pageLength: 10,
	allData: [],
	selectFunction: null,

	init: function(func) {
		this.cur = -1;
		this.max = 0;
		this.lastQnaNo = 99999999;
		this.idPerPage = 5;
		this.pageLength = 10;
		this.allData = [];
		this.selectFunction = func;
	},

	constructQnaList: function(page) {
		let html = '';
		if (this.allData.length == 0) {
			html += '<tr colspan="2" class="my-3 text-center" style="font-size: 13px;"><td colspan="2">Q&A가 존재하지 않습니다.</td></tr>';
			$('#qna_list').append(html);
			return;
		}
		$('#qna_list_tbody').empty();
		for (let i = page * this.idPerPage; i < Math.min((page + 1) * this.idPerPage, this.allData.length); ++i) {
			let qnaNo = this.allData[i].qnaNo;
			let qnaDate = this.allData[i].qnaDate;
			let subject = this.allData[i].subject;
			let content = this.allData[i].content;
			html += '<tr class="each-qna" style="margin-bottom: 0px;">';
			html += '<input type="hidden" id="qna_no" class="qna-no" value="' + qnaNo + '">';
			html += '<td>';
			html += '<div id="qna_subject" class="qna-subject">' + subject + '</div>';
			html += '</td>';
			html += '<td>';
			html += '<div id="qna_date" class="qna-date">' + qnaDate + '</div>';
			html += '</td>';
			html += '</tr>';
			html += '<tr class="each-qna-content" id="qna_content' + qnaNo + '" style="display: none;">';
			html += '<td colspan="2">';
			html += '<div style="text-align: left; padding-left: 10px; padding-top: 10px; font-size: 13px;">' + content + '</div>';
			html += '</td>';
			html += '</tr>';
		}
		this.lastQnaNo = this.allData[this.allData.length - 1].qnaNo;
		$('#qna_list_tbody').append(html);
		$('.each-qna').unbind();
		$('.each-qna').click(function () {
			let qnaNo = $(this).find('#qna_no').val();
			let sub = $(this).parent().find('#qna_content' + qnaNo);
			if (sub.css('display') == 'table-row') {
				sub.css('display', 'none');
			} else {
				let all = $(this).parent().find('.each-qna-content');
				all.css('display', 'none');
				sub.css('display', 'table-row');
			}
		});
	},

	constructPagination: function() {
		$('.pagination').empty();
		let html = '<a id="prev_page" href="#">&laquo;</a>';
		for (let i = this.cur * this.pageLength + 1; i < (this.cur + 1) * this.pageLength; ++i) {
			if (i > Math.floor((this.allData.length - 1) / this.idPerPage) + 1) {
				break;
			}
			html += '<a class="page-no" href="#">' + i + '</a>';
		}
		html += '<a id="next_page" href="#">&raquo;</a>';
		$('.pagination').append(html);
		$('.page-no').unbind();
		$('.page-no').click(function () {
			constructQnaMobile.constructQnaList(Number($(this).text()) - 1);
		});
		$('#prev_page').click(function () {
			$('#prev_page').unbind();
			if (constructQnaMobile.cur > 0) {
				constructQnaMobile.cur -= 1;
				constructQnaMobile.constructPagination();
				constructQnaMobile.constructQnaList(cur * constructQnaMobile.pageLength);
			}
		});
		$('#next_page').click(function () {
			$('#next_page').unbind();
			if (constructQnaMobile.max == constructQnaMobile.cur) {
				constructQnaMobile.selectFunction();
			} else {
				constructQnaMobile.cur += 1;
				constructQnaMobile.constructPagination();
				constructQnaMobile.constructQnaList(cur * constructQnaMobile.pageLength);
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
		this.constructQnaList(this.cur * this.pageLength);
		this.max = Math.max(this.max, this.cur);
	}
};