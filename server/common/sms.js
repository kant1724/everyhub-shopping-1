let querystring = require('querystring');
let https = require('https');
let sender = '01094278169';
let admin = '01094278169';

/**
 * 알리고 응답을 성공/실패로 해석한다.
 *
 * 응답은 {"result_code":"1","message":"success"} 또는
 * {"result_code":"-101","message":"인증오류입니다.-IP"} 형태다.
 * result_code 가 양수일 때만 실제 접수된 것이고, 음수는 거절이다.
 * (-101 은 인증오류이며, 뒤에 -IP 가 붙으면 발신 IP 가 등록되지 않은 경우다.)
 */
function parseAligoResult(body) {
	try {
		let json = JSON.parse(body);
		let code = Number(json.result_code);
		return {
			ok: Number.isFinite(code) && code > 0,
			code: json.result_code,
			message: json.message || ''
		};
	} catch (e) {
		// JSON 이 아니면 무엇이 왔는지 알 수 없으므로 실패로 본다
		return { ok: false, code: null, message: String(body).slice(0, 200) };
	}
}

module.exports = {
	sendSMS: function (title, msg, telno) {
		/******************** 전송정보 ********************/
		let post_data = querystring.stringify({
			'user_id': 'gandeurak',
			'key': '2ooosa44ffzsiqlzz7157p0qlnid82mp',
			'msg': msg,
			'receiver': admin,
			'destination': admin,
			'sender': sender,
			'rdate': '',
			'rtime': '',
			'testmode_yn': 'N',
			'title': title
		});
		console.log(telno);
		let post_options = {
			host: 'apis.aligo.in',
			port: '443',
			path: '/send/',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(post_data)
			}
		};

		let post_req = https.request(post_options, function (res) {
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				console.log('Response: ' + chunk);
			});
		});

		// 리스너가 없으면 'error' 이벤트가 처리되지 않아 프로세스 전체가 죽는다.
		// 문자 한 통이 안 보내진 것 때문에 서버가 내려가서는 안 되므로 기록만 남긴다.
		post_req.on('error', function (err) {
			console.error('[sms] 전송 실패 ' + err.code + ': ' + err.message);
		});
		console.log(msg);
		post_req.write(post_data);
		post_req.end();
	},

	/**
	 * 지정한 번호로 문자를 보낸다.
	 *
	 * callback 은 선택이다. 넘기면 { ok, code, message } 로 실제 접수 결과를
	 * 알려준다. 인증번호처럼 "보냈다"를 사용자에게 알려야 하는 경우에는 반드시
	 * 결과를 확인해야 한다. 결과를 보지 않으면 알리고가 거절했는데도 전송된 것처럼
	 * 안내하게 되고, 사용자는 오지 않는 문자를 계속 기다린다.
	 */
	sendSMS2: function (title, msg, telno, callback) {
		/******************** 전송정보 ********************/
		let post_data = querystring.stringify({
			'user_id': 'gandeurak',
			'key': '2ooosa44ffzsiqlzz7157p0qlnid82mp',
			'msg': msg,
			'receiver': telno,
			'destination': telno,
			'sender': sender,
			'rdate': '',
			'rtime': '',
			'testmode_yn': 'N',
			'title': title
		});
		let post_options = {
			host: 'apis.aligo.in',
			port: '443',
			path: '/send/',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(post_data)
			}
		};

		// 응답이 오든 실패하든 callback 은 정확히 한 번만 부른다
		let done = false;
		let finish = function (result) {
			if (done) return;
			done = true;
			if (!result.ok) {
				console.error('[sms] 전송 실패 (code=' + result.code + '): ' + result.message);
			}
			if (callback) callback(result);
		};

		let post_req = https.request(post_options, function (res) {
			res.setEncoding('utf8');
			let body = '';
			res.on('data', function (chunk) { body += chunk; });
			res.on('end', function () {
				console.log('Response: ' + body);
				finish(parseAligoResult(body));
			});
		});

		// 리스너가 없으면 'error' 이벤트가 처리되지 않아 프로세스 전체가 죽는다.
		// 문자 한 통이 안 보내진 것 때문에 서버가 내려가서는 안 된다.
		post_req.on('error', function (err) {
			finish({ ok: false, code: err.code, message: err.message });
		});
		// 알리고가 응답하지 않으면 가입 요청이 끝나지 않으므로 제한시간을 둔다
		post_req.setTimeout(10000, function () {
			post_req.destroy();
			finish({ ok: false, code: 'TIMEOUT', message: '알리고 응답 없음' });
		});
		post_req.write(post_data);
		post_req.end();
	}
};
