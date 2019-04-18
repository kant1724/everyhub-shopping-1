let constructShippingInfo =  {
	cur: -1,
	max: 0,
	lastShippingInfoNo: 99999999,
	idPerPage: 5,
	pageLength: 10,
	allData: [],
	selectFunction: null,
	deleteFunction: null,

	init: function(selectFunc, deleteFunc) {
		this.cur = -1;
		this.max = 0;
		this.lastShippingInfoNo = 99999999;
		this.idPerPage = 5;
		this.pageLength = 10;
		this.allData = [];
		this.selectFunction = selectFunc;
		this.deleteFunction = deleteFunc;
	},

	constructShippingInfoList: function(page) {
		let html = '';
		if (this.allData.length == 0) {
			html += '<tr class="my-3" style="font-size: 13px;"><td colspan="3">배송정보가 존재하지 않습니다.</td></tr>';
			$('#shipping_info_list').append(html);
			return;
		}
		$('#shipping_info_list_tbody').empty();
		for (let i = page * this.idPerPage; i < Math.min((page + 1) * this.idPerPage, this.allData.length); ++i) {
			let shippingInfoNo = this.allData[i].shippingInfoNo;
			let addr1 = this.allData[i].addr1;
			let addr2 = this.allData[i].addr2;
			let addr3 = this.allData[i].addr3;
			let zipNo = this.allData[i].zipNo;
			let shippingFee = this.allData[i].shippingFee;
			let exceptKeyword = this.allData[i].exceptKeyword;
			html += '<tr class="text-center each-shipping-info" style="margin-bottom: 0px;">';
			if (shippingInfoNo == 'del') {
				html += '<td colspan="8">삭제된 데이터입니다.</td>';
			} else {
				html += '<input type="hidden" id="shipping_info_no" class="shipping-info-no" value="' + shippingInfoNo + '">';
				html += '<td>';
				html += '<div>' + shippingInfoNo + '</div>';
				html += '</td>';
				html += '<td>';
				html += '<div id="addr_1" class="addr-1">' + addr1 + '</div>';
				html += '</td>';
				html += '<td>';
				html += '<div id="addr_2" class="addr-2">' + addr2 + '</div>';
				html += '</td>';
				html += '<td>';
				html += '<div id="addr_3" class="addr-3">' + addr3 + '</div>';
				html += '</td>';
				html += '<td>';
				html += '<div id="zip_no" class="zip-no">' + zipNo + '</div>';
				html += '</td>';
				html += '<td>';
				html += '<div id="shipping_fee" class="shipping-fee">' + shippingFee + '</div>';
				html += '</td>';
				html += '<td>';
				html += '<div id="except_keyword" class="except-keyword">' + exceptKeyword + '</div>';
				html += '</td>';
				html += '<td>';
				html += '<div class="delete-shipping-info text-underline-link">삭제</div>';
				html += '</td>';
			}
			html += '</tr>';
		}
		this.lastShippingInfoNo = this.allData[this.allData.length - 1].shippingInfoNo;
		$('#shipping_info_list_tbody').append(html);

		$('.delete-shipping-info').unbind();
		$('.delete-shipping-info').click(function() {
			let shippingInfoNo = $(this).parent().parent().find('#shipping_info_no').val();
			$(this).parent().parent().empty().append('<td colspan="8">삭제된 데이터입니다.</td>');
			for (let i = 0; i < constructShippingInfo.allData.length; ++i) {
				if (constructShippingInfo.allData[i].shippingInfoNo == shippingInfoNo) {
					constructShippingInfo.allData[i].shippingInfoNo = 'del';
				}
			}
			constructShippingInfo.deleteFunction(shippingInfoNo);
		});
	},

	constructPagination: function() {
		$('.shipping-info-pagination').empty();
		let html = '<a id="shipping_info_prev_page">&laquo;</a>';
		for (let i = this.cur * this.pageLength + 1; i < (this.cur + 1) * this.pageLength; ++i) {
			if (i > Math.floor((this.allData.length - 1) / this.idPerPage) + 1) {
				break;
			}
			if (i == this.cur * this.pageLength + 1) {
				html += '<a class="shipping-info-page-no active">' + i + '</a>';
			} else {
				html += '<a class="shipping-info-page-no">' + i + '</a>';
			}
		}
		html += '<a id="shipping_info_next_page">&raquo;</a>';
		$('.shipping-info-pagination').append(html);
		$('.shipping-info-page-no').unbind();
		$('.shipping-info-page-no').click(function() {
			$('.shipping-info-page-no').prop('class', 'shipping-info-page-no');
			$(this).prop('class', 'shipping-info-page-no active');
			constructShippingInfo.constructShippingInfoList(Number($(this).text()) - 1);
		});
		$('#shipping_info_prev_page').click(function() {
			$('#shipping_info_prev_page').unbind();
			if (constructShippingInfo.cur > 0) {
				constructShippingInfo.cur -= 1;
				constructShippingInfo.constructPagination();
				constructShippingInfo.constructShippingInfoList(constructShippingInfo.cur * constructShippingInfo.pageLength);
			}
		});
		$('#shipping_info_next_page').click(function() {
			$('#shipping_info_next_page').unbind();
			if (constructShippingInfo.max == constructShippingInfo.cur) {
				constructShippingInfo.selectFunction();
			} else {
				constructShippingInfo.cur += 1;
				constructShippingInfo.constructPagination();
				constructShippingInfo.constructShippingInfoList(constructShippingInfo.cur * constructShippingInfo.pageLength);
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
			this.constructShippingInfoList(this.cur * this.pageLength);
			this.max = Math.max(this.max, this.cur);
		}
	}
};
