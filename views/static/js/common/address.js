let searchAddressApi = {
	totalCount: 0,
	countPerPage: 10,
	totalPage: 0,
	curPageGroup: 1,
	countPerPageGroup: 5,
	curKeyword: '',

	init: function() {
		$('#search_address_modal').click(function() {
			let keyword = $('#address_subject').val();
			searchAddressApi.searchAddress(1, keyword);
		});

		$('#address_subject').keydown(function(key) {
			if (key.keyCode == 13) {
				let keyword = $('#address_subject').val();
				searchAddressApi.searchAddress(1, keyword);
			}
		});
		$('#pagination').empty();
		$('#address_tbody').empty();
		$('#address_subject').val('');
	},

	searchAddressAjax: function(page, keyword, gubun) {
		this.curKeyword = keyword;
		let url = 'http://www.juso.go.kr/addrlink/addrLinkApi.do?currentPage=' + page + '&countPerPage=' + this.countPerPage + '&keyword=' + encodeURIComponent(keyword) + '&confmKey=U01TX0FVVEgyMDE5MDIyODE5MzIxMTEwODU1MTA=&resultType=json';
		$.ajax({
			url: url,
			type: 'GET',
			dataType: 'json',
			success: function (jsonStr) {
				let errCode = jsonStr.results.common.errorCode;
				let errDesc = jsonStr.results.common.errorMessage;
				if (errCode != '0') {
				} else {
					searchAddressApi.constructAddress(jsonStr, gubun);
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
		this.searchAddressAjax(page, keyword, 1);
	},

	searchAddressByClickPage: function(page, keyword) {
		this.searchAddressAjax(page, keyword, 2);
	},

	constructPagination: function() {
		$('#pagination').empty();
		this.totalPage = Math.floor((Number(this.totalCount) - 1) / Number(this.countPerPage)) + 1;
		let html = '<a id="go_prev_page_group" class="ml-1 mr-1 px-2" style="font-size: 16px;">&laquo;</a>';
		let start = (this.curPageGroup - 1) * this.countPerPageGroup;
		for (let i = start; i < start + this.countPerPageGroup && i < this.totalPage; ++i) {
			if ( i == start) {
				html += '<a class="page-index ml-1 mr-1 px-2" style="border: 1px solid #333; font-size: 16px; font-weight: 700;">' + (i + 1) + '</a>';
			} else {
				html += '<a class="page-index ml-1 mr-1 px-2" style="border: 1px solid #333; font-size: 16px;">' + (i + 1) + '</a>';
			}
		}
		html += '<a id="go_next_page_group" class="ml-1 mr-1 px-2" style="font-size: 16px;">&raquo;</a>';
		$('#pagination').append(html);
		$('#go_prev_page_group').unbind();
		$('#go_next_page_group').click(function() {
			$('#go_next_page_group').unbind();
			if (searchAddressApi.curPageGroup == Math.floor((searchAddressApi.totalPage - 1) / searchAddressApi.countPerPageGroup + 1)) return;
			searchAddressApi.curPageGroup += 1;
			searchAddressApi.constructPagination();
			searchAddressApi.searchAddressByClickPage(start + searchAddressApi.countPerPageGroup + 1, searchAddressApi.curKeyword);
		});
		$('#go_prev_page_group').unbind();
		$('#go_prev_page_group').click(function() {
			$('#go_prev_page_group').unbind();
			if (searchAddressApi.curPageGroup == 1) return;
			searchAddressApi.curPageGroup -= 1;
			searchAddressApi.constructPagination();
			searchAddressApi.searchAddressByClickPage(start - searchAddressApi.countPerPageGroup + 1, searchAddressApi.curKeyword);
		});
		$('.page-index').click(function() {
			let curPage = $(this).text();
			$('.page-index').css('font-weight', '300');
			$(this).css('font-weight', '700');
			searchAddressApi.searchAddressByClickPage(curPage, searchAddressApi.curKeyword);
		});
	},

	constructAddress: function(ret, gubun) {
		$('#address_tbody').empty();
		let juso = ret.results.juso;
		let html = '';
		for (let i = 0; i < juso.length; ++i) {
			html += '<tr class="each-address">';
			let roadAddrPart1 = juso[i].roadAddrPart1;
			let zipNo = juso[i].zipNo;
			html += '<td id="address_main" style="padding: 3px;">' + roadAddrPart1 + '</td>';
			html += '<td id="zip_no" style="padding: 3px;">' + zipNo + '</td>';
			html += '</tr>';
		}
		searchAddressApi.totalCount = ret.results.common.totalCount;
		if (gubun == 1) {
			searchAddressApi.constructPagination();
		}
		$('#address_tbody').append(html);

		$('.each-address').click(function() {
			$('#' + $('#zip_no_id').val()).text($(this).find('#zip_no').text());
			$('#' + $('#zip_no_id').val()).css('color', 'black');
			$('#' + $('#address_main_id').val()).text($(this).find('#address_main').text());
			$('#' + $('#address_main_id').val()).css('color', 'black');

			if ($('#address_main_id').val() == 'receive_address_main') {
				selectShippingInfoByZipNo($(this).find('#zip_no').text());
			}

			$('#address_close_modal').click();
		});
	}
};
