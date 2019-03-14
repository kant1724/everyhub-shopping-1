const jwt = require('jsonwebtoken');

exports.check = (req, res, next) => {
	let token = req.body.token;
	if (!token) {
		token = req.cookies.jwt;
	} else {
		res.cookie('jwt', token);
	}

	if (!token) {
		return res.status(403).json({
			success: false,
			message: 'not logged in'
		});
	}

	const p = new Promise(
		(resolve, reject) => {
			jwt.verify(token, req.app.get('jwt-secret'), (err, decoded) => {
				if (err) reject(err);
				resolve(decoded)
			});
		}
	);

	const respond = (token) => {
		next();
	};

	const onError = (error) => {
		res.status(403).json({
			success: false,
			message: error.message
		});
	};

	p.then(respond).catch(onError);
};

exports.getInfo = (req) => {
	let token = req.body.token;
	if (!token) {
		token = req.cookies.jwt;
	}
	return jwt.verify(token, req.app.get('jwt-secret'));
};

exports.getUserNo = (req) => {
	let token = req.cookies.jwt;
	let decoded = jwt.verify(token, req.app.get('jwt-secret'));

	return decoded.userNo ? decoded.userNo : 0;
};

exports.getAdminYn = (req) => {
	let token = req.cookies.jwt;
	let decoded = jwt.verify(token, req.app.get('jwt-secret'));

	return decoded.adminYn ? decoded.adminYn : 'N';
};
