let searchAddressApi = {
	totalCount: 0,
	countPerPage: 10,
	totalPage: 0,
	curPageGroup: 1,
	countPerPageGroup: 10,
	curKeyword: '',
	searchAddressAjax: function(page, keyword) {
		this.curKeyword = keyword;
		$.ajax({
			url: 'http://www.juso.go.kr/addrlink/addrLinkApi.do?currentPage=' + page + '&countPerPage=' + this.countPerPage + '&keyword=' + keyword + '&confmKey=U01TX0FVVEgyMDE5MDIyODE5MzIxMTEwODU1MTA=&resultType=json',
			type: 'GET',
			dataType: 'json',
			success: function (jsonStr) {
				let errCode = jsonStr.results.common.errorCode;
				let errDesc = jsonStr.results.common.errorMessage;
				if (errCode != '0') {
				} else {
					searchAddressApi.constructAddress(jsonStr);
				}
			},
			error: function (xhr, status, error) {
				alert('에러발생');
			}
		});
	},

	searchAddress: function(page, keyword) {
		this.curPageGroup = 1;
		this.totalCount = 0;
		this.searchAddressAjax(page, keyword);
	},

	searchAddressByClickPage: function(page, keyword) {
		this.searchAddressAjax(page, keyword);
	},

	constructPagination: function() {
		$('#pagination').empty();
		this.totalPage = Math.floor((Number(this.totalCount) - 1) / Number(this.countPerPage)) + 1;
		let html = '<a id="go_prev_page_group" class="ml-2 mr-1">《</a>';
		let start = (this.curPageGroup - 1) * this.countPerPageGroup;
		for (let i = start; i < start + this.countPerPageGroup && i < this.totalPage; ++i) {
			html += '<a class="page-index ml-2 mr-1">' + (i + 1) + '</a>';
		}
		html += '<a id="go_next_page_group" class="ml-2 mr-1">》</a>';
		$('#pagination').append(html);
		$('#go_prev_page_group').unbind();
		$('#go_next_page_group').click(function() {
			$('#go_next_page_group').unbind();
			if (searchAddressApi.curPageGroup == Math.floor((searchAddressApi.totalPage - 1) / searchAddressApi.countPerPageGroup + 1)) return;
			searchAddressApi.curPageGroup += 1;
			searchAddressApi.constructPagination();
		});
		$('#go_prev_page_group').unbind();
		$('#go_prev_page_group').click(function() {
			$('#go_prev_page_group').unbind();
			if (searchAddressApi.curPageGroup == 1) return;
			searchAddressApi.curPageGroup -= 1;
			searchAddressApi.constructPagination();
		});
		$('.page-index').click(function() {
			let curPage = $(this).text();
			searchAddressApi.searchAddressByClickPage(curPage, searchAddressApi.curKeyword);
		});
	},

	constructAddress: function(ret) {
		$('#address_tbody').empty();
		let juso = ret.results.juso;
		let html = '';
		for (let i = 0; i < juso.length; ++i) {
			html += '<tr>';
			let roadAddrPart1 = juso[i].roadAddrPart1;
			let zipNo = juso[i].zipNo;
			html += '<td style="padding: 3px;">' + roadAddrPart1 + '</td>';
			html += '<td style="padding: 3px;">' + zipNo + '</td>';
			html += '</tr>';
		}
		searchAddressApi.totalCount = ret.results.common.totalCount;
		searchAddressApi.constructPagination();
		$('#address_tbody').append(html);
	}
};
