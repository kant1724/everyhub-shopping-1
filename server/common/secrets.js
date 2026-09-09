/**
 * 세션·토큰 서명에 쓰는 비밀값을 관리한다.
 *
 * 예전에는 환경변수가 없으면 프로세스마다 임의의 값을 새로 만들었다. 소스에
 * 비밀값을 박아두는 것보다는 안전하지만, 서버를 다시 띄울 때마다 값이 바뀌므로
 * 접속해 있던 사람들의 로그인이 전부 풀린다. forever 로 재시작이 잦으면 더 그렇다.
 *
 * 그래서 순서를 이렇게 둔다.
 *   1) 환경변수가 있으면 그것을 쓴다 (운영에서 권장. 파일보다 우선)
 *   2) 없으면 secrets.json 에 저장해 둔 값을 쓴다
 *   3) 파일도 없으면 새로 만들어 저장한다 (다음 재시작에도 같은 값이 유지된다)
 *   4) 저장까지 실패하면 예전처럼 이번 프로세스에서만 쓸 임시값을 쓴다
 *
 * secrets.json 은 비밀값이므로 .gitignore 에 넣어 두었다. 절대 커밋하지 않는다.
 * 파일을 지우면 새 값이 만들어지고, 그때는 기존 로그인이 모두 풀린다.
 */
let fs = require('fs');
let path = require('path');
let crypto = require('crypto');

const SECRET_FILE = process.env.SECRET_FILE || path.join(__dirname, '..', '..', 'secrets.json');

let cache = null;      // 파일에서 읽은 값
let warned = false;

function newSecret() {
	return crypto.randomBytes(48).toString('hex');
}

function readFile() {
	try {
		let raw = fs.readFileSync(SECRET_FILE, 'utf8');
		let obj = JSON.parse(raw);
		return (obj && typeof obj === 'object') ? obj : {};
	} catch (e) {
		return {};        // 없거나 깨졌으면 새로 만든다
	}
}

function writeFile(obj) {
	// mode 0600: 서버에서 같은 장비의 다른 사용자가 읽지 못하게 한다.
	// (Windows 에서는 mode 가 사실상 무시되지만 오류는 나지 않는다)
	fs.writeFileSync(SECRET_FILE, JSON.stringify(obj, null, 2) + '\n', { mode: 0o600 });
}

module.exports = {
	SECRET_FILE: SECRET_FILE,

	/**
	 * 이름에 해당하는 비밀값을 돌려준다. 없으면 만들어 저장한다.
	 * name 예: 'SESSION_SECRET', 'JWT_SECRET'
	 */
	get: function (name) {
		if (process.env[name]) return process.env[name];

		if (cache === null) cache = readFile();
		if (typeof cache[name] === 'string' && cache[name].length >= 32) return cache[name];

		let value = newSecret();
		cache[name] = value;
		try {
			writeFile(cache);
			console.log('[secrets] ' + name + ' 을(를) 새로 만들어 저장했습니다: ' + SECRET_FILE);
		} catch (e) {
			// 저장에 실패하면 이번 프로세스에서만 유효한 값이 된다.
			// 재시작하면 로그인이 풀리므로 원인을 알 수 있게 남긴다.
			if (!warned) {
				warned = true;
				console.warn('[secrets] 비밀값을 저장하지 못했습니다 (' + e.code + '): ' + SECRET_FILE);
				console.warn('[secrets] 재시작할 때마다 로그인이 풀립니다. 쓰기 권한을 주거나,');
				console.warn('[secrets] SESSION_SECRET / JWT_SECRET 환경변수를 지정하세요.');
			}
		}
		return value;
	}
};
