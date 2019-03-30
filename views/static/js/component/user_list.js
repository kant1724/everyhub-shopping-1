let constructUserList =  {
	cur: -1,
	max: 0,
	lastUserNo: 99999999,
	idPerPage: 15,
	pageLength: 10,
	allData: [],
	selectFunction: null,

	init: function(func) {
		this.cur = -1;
		this.max = 0;
		this.lastUserNo = 99999999;
		this.idPerPage = 15;
		this.pageLength = 10;
		this.allData = [];
		this.selectFunction = func;
	},

	constructUserList: function(page) {
		let html = '';
		if (this.allData.length == 0) {
			html += '<tr class="my-3" style="font-size: 13px;"><td colspan="3">회원정보가 존재하지 않습니다.</td></tr>';
			$('#user_list').append(html);
			return;
		}
		$('#user_list_tbody').empty();
		for (let i = page * this.idPerPage; i < Math.min((page + 1) * this.idPerPage, this.allData.length); ++i) {
			let userNo = this.allData[i].userNo;
			let userNm = this.allData[i].userNm;
			let telno = this.allData[i].telno;
			let managerNm = this.allData[i].managerNm ? this.allData[i].managerNm : '';
			let managerTelno = this.allData[i].managerTelno ? this.allData[i].managerTelno : '';
			html += '<tr class="each-user" style="margin-bottom: 0px;">';
			html += '<input type="hidden" id="user_no" value="' + userNo + '">';
			html += '<td>' + userNm + '</td>';
			html += '<td>' + telno + '</td>';
			html += '<td>' + managerNm + '</td>';
			html += '<td>' + managerTelno + '</td>';
			html += '<td><a class="save-manager-telno-btn" style="text-decoration: underline; color: gray; font-size: 12px;">매니저지정</a></td>';
			html += '</tr>';
		}
		this.lastUserNo = this.allData[this.allData.length - 1].userNo;
		$('#user_list_tbody').append(html);
		$('.save-manager-telno-btn').unbind();
		$('.save-manager-telno-btn').click(function() {
			let userNo = $(this).parent().parent().find('#user_no').val();
			$('#modal_user_no').val(userNo);
			$('#manager_modal').modal();
		});
	},

	constructPagination: function() {
		$('.user-list-pagination').empty();
		let html = '<a id="user_list_prev_page">&laquo;</a>';
		for (let i = this.cur * this.pageLength + 1; i < (this.cur + 1) * this.pageLength; ++i) {
			if (i > Math.floor((this.allData.length - 1) / this.idPerPage) + 1) {
				break;
			}
			if (i == this.cur * this.pageLength + 1) {
				html += '<a class="user-list-page-no active">' + i + '</a>';
			} else {
				html += '<a class="user-list-page-no">' + i + '</a>';
			}
		}
		html += '<a id="user_list_next_page">&raquo;</a>';
		$('.user-list-pagination').append(html);
		$('.user-list-page-no').unbind();
		$('.user-list-page-no').click(function() {
			$('.user-list-page-no').prop('class', 'user-list-page-no');
			$(this).prop('class', 'user-list-page-no active');
			constructUserList.constructUserList(Number($(this).text()) - 1);
		});
		$('#user_list_prev_page').click(function() {
			$('#user_list_prev_page').unbind();
			if (constructUserList.cur > 0) {
				constructUserList.cur -= 1;
				constructUserList.constructPagination();
				constructUserList.constructUserList(constructUserList.cur * constructUserList.pageLength);
			}
		});
		$('#user_list_next_page').click(function() {
			$('#user_list_next_page').unbind();
			if (constructUserList.max == constructUserList.cur) {
				constructUserList.selectFunction();
			} else {
				constructUserList.cur += 1;
				constructUserList.constructPagination();
				constructUserList.constructUserList(constructUserList.cur * constructUserList.pageLength);
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
			this.constructUserList(this.cur * this.pageLength);
			this.max = Math.max(this.max, this.cur);
		}
	}
};
