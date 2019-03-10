function ajax() {
	$.ajax({
		url: "http://www.juso.go.kr/addrlink/addrLinkApi.do?currentPage=1&countPerPage=10&keyword=%EA%B0%95%EC%84%9C%EB%A1%9C7%EA%B8%B8&confmKey=TESTJUSOGOKR&resultType=json",
		type: "GET",
		dataType: "json"
		, success: function (jsonStr) { // jsonStr : 주소 검색 결과 JSON 데이터
			var errCode = jsonStr.results.common.errorCode;
			var errDesc = jsonStr.results.common.errorMessage;
			if (errCode != "0") {
				alert(errCode + "=" + errDesc);
			} else {
				alert(jsonStr);
			}
		}
		, error: function (xhr, status, error) {
			alert("에러발생"); // AJAX 호출 에러
		}
	});
}

ajax();