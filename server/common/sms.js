let querystring = require('querystring');
let https = require('https');
//let admin = '01024552308';
let admin = '01094278169';

module.exports = {
	sendSMS: function (title, msg, telno) {
		/******************** 전송정보 ********************/
		let post_data = querystring.stringify({
			'user_id': 'kant1724',
			'key': '0xvx6k8kgncgs6fw2ar9mtoh0dpah57g',
			'msg': msg,
			'receiver': telno + ',' + admin,
			'destination': telno + ',' + admin,
			'sender': telno,
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
		console.log(msg);
		post_req.write(post_data);
		post_req.end();
	},

	sendSMS2: function (title, msg, telno) {
		/******************** 전송정보 ********************/
		let post_data = querystring.stringify({
			'user_id': 'kant1724',
			'key': '0xvx6k8kgncgs6fw2ar9mtoh0dpah57g',
			'msg': msg,
			'receiver': telno,
			'destination': telno,
			'sender': telno,
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

		let post_req = https.request(post_options, function (res) {
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				console.log('Response: ' + chunk);
			});
		});
		post_req.write(post_data);
		post_req.end();
	}
};
