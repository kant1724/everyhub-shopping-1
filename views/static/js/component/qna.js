let constructQna =  {
	cur: -1,
	max: 0,
	lastQnaNo: 99999999,
	idPerPage: 5,
	pageLength: 10,
	allData: [],
	selectFunction: null,
	selectReplyFunction: null,
	writeReplyFunction: null,

	init: function(selectFunc, selectReplyFunc, writeReplyFunc) {
		this.cur = -1;
		this.max = 0;
		this.lastQnaNo = 99999999;
		this.idPerPage = 5;
		this.pageLength = 10;
		this.allData = [];
		this.selectFunction = selectFunc;
		this.selectReplyFunction = selectReplyFunc;
		this.writeReplyFunction = writeReplyFunc;
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
			html += '<tr class="each-qna-content" id="qna_content' + qnaNo + '" style="display: none;">';
			html += '<td colspan="3">';
			html += '<input type="hidden" class="qna-no" value="' + qnaNo + '">';
			html += '<div style="text-align: left; padding-left: 10px; font-size: 13px; padding-top: 15px;">' + content + '</div>';
			html += '<div id="qna_reply_list_' + qnaNo + '" class="qna-reply-list"></div>';
			html += '<div class="mt-3 mb-3 text-left"><textarea id="qna_reply_text" style="width: 80%; height: 100px;"></textarea></div>';
			html += '<div class="text-left"><a id="write_qna_reply_btn" class="write-qna-reply-btn common-button-1">답글작성</a></div>';
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
				sub.find('.qna-reply-list').empty();
			} else {
				let all = $(this).parent().find('.each-qna-content');
				all.css('display', 'none');
				sub.css('display', 'table-row');
				constructQna.selectReplyFunction(qnaNo);
			}
		});
		$('.write-qna-reply-btn').unbind();
		$('.write-qna-reply-btn').click(function() {
			let qnaNo = $(this).parent().parent().parent().find('.qna-no').val();
			let content = $(this).parent().parent().find('#qna_reply_text').val();
			constructQna.writeReplyFunction(qnaNo, content);
		});
	},

	constructPagination: function() {
		$('.qna-pagination').empty();
		let html = '<a id="qna_prev_page">&laquo;</a>';
		for (let i = this.cur * this.pageLength + 1; i < (this.cur + 1) * this.pageLength; ++i) {
			if (i > Math.floor((this.allData.length - 1) / this.idPerPage) + 1) {
				break;
			}
			html += '<a class="qna-page-no">' + i + '</a>';
		}
		html += '<a id="qna_next_page">&raquo;</a>';
		$('.qna-pagination').append(html);
		$('.qna-page-no').unbind();
		$('.qna-page-no').click(function () {
			constructQna.constructQnaList(Number($(this).text()) - 1);
		});
		$('#qna_prev_page').click(function () {
			$('#qna_prev_page').unbind();
			if (constructQna.cur > 0) {
				constructQna.cur -= 1;
				constructQna.constructPagination();
				constructQna.constructQnaList(cur * constructQna.pageLength);
			}
		});
		$('#qna_next_page').click(function () {
			$('#qna_next_page').unbind();
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
	},

	selectReplyCallback: function(data) {
		if (data.length > 0) {
			let qnaNo = data[0].qnaNo;
			$('#qna_reply_list_' + qnaNo).empty();
			let html = '';
			for (let i = 0; i < data.length; ++i) {
				let content = data[i].content;
				html += '<div class="text-left mt-4 mb-3" style="width: 80%; background: #EAEAEA; padding: 10px; border-radius: 5px;"><div style="font-weight: 700;">답변:</div><div>' + content + '</div></div>';
			}
			$('#qna_reply_list_' + qnaNo).append(html);
		}
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
	selectReplyFunction: null,
	writeReplyFunction: null,

	init: function(selectFunc, selectReplyFunc, writeReplyFunc) {
		this.cur = -1;
		this.max = 0;
		this.lastQnaNo = 99999999;
		this.idPerPage = 5;
		this.pageLength = 10;
		this.allData = [];
		this.selectFunction = selectFunc;
		this.selectReplyFunction = selectReplyFunc;
		this.writeReplyFunction = writeReplyFunc;
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
			html += '<input type="hidden" class="qna-no" value="' + qnaNo + '">';
			html += '<div style="text-align: left; padding-left: 10px; padding-top: 10px; font-size: 13px;">' + content + '</div>';
			html += '<div id="qna_reply_list_' + qnaNo + '" class="qna-reply-list"></div>';
			html += '<div class="mt-3 mb-3 text-left"><textarea id="qna_reply_text" style="width: 80%; height: 100px;"></textarea></div>';
			html += '<div class="text-left"><a id="write_qna_reply_btn" class="write-qna-reply-btn common-button-1">답글작성</a></div>';
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
				constructQnaMobile.selectReplyFunction(qnaNo);
			}
		});
		$('.write-qna-reply-btn').unbind();
		$('.write-qna-reply-btn').click(function() {
			let qnaNo = $(this).parent().parent().parent().find('.qna-no').val();
			let content = $(this).parent().parent().find('#qna_reply_text').val();
			constructQnaMobile.writeReplyFunction(qnaNo, content);
		});
	},

	constructPagination: function() {
		$('.qna-pagination').empty();
		let html = '<a id="qna_prev_page">&laquo;</a>';
		for (let i = this.cur * this.pageLength + 1; i < (this.cur + 1) * this.pageLength; ++i) {
			if (i > Math.floor((this.allData.length - 1) / this.idPerPage) + 1) {
				break;
			}
			html += '<a class="qna-page-no">' + i + '</a>';
		}
		html += '<a id="qna_next_page">&raquo;</a>';
		$('.qna-pagination').append(html);
		$('.qna-page-no').unbind();
		$('.qna-page-no').click(function () {
			constructQnaMobile.constructQnaList(Number($(this).text()) - 1);
		});
		$('#qna_prev_page').click(function () {
			$('#qna_prev_page').unbind();
			if (constructQnaMobile.cur > 0) {
				constructQnaMobile.cur -= 1;
				constructQnaMobile.constructPagination();
				constructQnaMobile.constructQnaList(constructQnaMobile.cur * constructQnaMobile.pageLength);
			}
		});
		$('#qna_next_page').click(function () {
			$('#qna_next_page').unbind();
			if (constructQnaMobile.max == constructQnaMobile.cur) {
				constructQnaMobile.selectFunction();
			} else {
				constructQnaMobile.cur += 1;
				constructQnaMobile.constructPagination();
				constructQnaMobile.constructQnaList(constructQnaMobile.cur * constructQnaMobile.pageLength);
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
	},

	selectReplyCallback: function(data) {
		if (data.length > 0) {
			let qnaNo = data[0].qnaNo;
			$('#qna_reply_list_' + qnaNo).empty();
			let html = '';
			for (let i = 0; i < data.length; ++i) {
				let content = data[i].content;
				html += '<div class="text-left mt-3 mb-3" style="width: 100%; background: #EAEAEA; padding: 10px; border-radius: 5px;"><div style="font-weight: 700;">답변:</div><div>' + content + '</div></div>';
			}
			$('#qna_reply_list_' + qnaNo).append(html);
		}
	}
};
