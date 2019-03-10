let searchAddressApi = {
	totalCount: 0,
	countPerPage: 10,
	searchAddressAjax: function(page, keyword, callback) {
		$.ajax({
			url: 'http://www.juso.go.kr/addrlink/addrLinkApi.do?currentPage=' + page + '&countPerPage=' + this.countPerPage + '&keyword=' + keyword + '&confmKey=U01TX0FVVEgyMDE5MDIyODE5MzIxMTEwODU1MTA=&resultType=json',
			type: 'GET',
			dataType: 'json',
			success: function (jsonStr) {
				let errCode = jsonStr.results.common.errorCode;
				let errDesc = jsonStr.results.common.errorMessage;
				if (errCode != '0') {
				} else {
					callback(jsonStr);
				}
			},
			error: function (xhr, status, error) {
				alert('에러발생');
			}
		});
	},

	searchAddress: function(page, keyword, callback) {
		this.searchAddressAjax(page, keyword, callback);
	},

	constructPagination: function() {
		$('#pagination').empty();
		let totalPage = Math.floor((Number(this.totalCount) - 1) / Number(this.countPerPage)) + 1;
		let html = '';
		for (let i = 0; i < totalPage; ++i) {
			html += '<a class="ml-2 mr-1">' + (i + 1) + '</a>';
		}
		$('#pagination').append(html);
	}
};
