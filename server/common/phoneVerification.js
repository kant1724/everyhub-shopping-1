/**
 * 휴대폰 본인인증 (회원가입용)
 *
 * 비밀번호 찾기(userBiz.getCertificationCode)는 이미 가입된 회원이라 인증번호를
 * USERS.CERTIFICATION_CODE 에 저장할 수 있다. 회원가입은 아직 USERS 행이 없으므로
 * 인증 상태를 DB 에 둘 수 없다. 그래서 두 곳에 나눠 보관한다.
 *
 *  - 발급된 인증번호 / 인증 완료 표시 : 세션 (요청한 브라우저만 확인할 수 있다)
 *  - 번호별 발송 제한               : 이 모듈의 메모리 Map
 *
 * 발송 제한을 세션에 두면 쿠키만 지우고 다시 요청해서 남의 번호로 문자를 계속
 * 보낼 수 있다(SMS 폭탄). 그래서 발송 횟수만은 세션과 무관하게 번호 기준으로 센다.
 * 상태가 프로세스 메모리에 있으므로 인스턴스 하나를 전제로 한다. 서버를 여러 대로
 * 늘리면 DB/Redis 로 옮겨야 한다.
 */
let crypto = require('crypto');

const CODE_TTL_MS = 5 * 60 * 1000;          // 인증번호 유효시간 5분
const MAX_ATTEMPTS = 5;                     // 인증번호 확인 시도 한도
const VERIFIED_TTL_MS = 30 * 60 * 1000;     // 인증 완료 후 가입까지 허용하는 시간
const RESEND_COOLDOWN_MS = 30 * 1000;       // 같은 번호 재발송 대기시간
const MAX_SENDS = 5;                        // 번호당 발송 한도
const SEND_WINDOW_MS = 60 * 60 * 1000;      // 발송 한도 집계 구간 1시간

const sendLog = new Map();                  // telno -> { count, windowEndsAt, lastSentAt }

/**
 * 0 이상 max 미만의 정수를 균등하게 뽑는다 (CSPRNG).
 *
 * randomBytes 로 뽑은 32비트 값을 그냥 % max 하면 앞쪽 숫자가 조금 더 자주
 * 나온다(모듈로 편향). max 의 배수를 넘는 구간은 버리고 다시 뽑아 편향을 없앤다.
 */
function randomBelow(max) {
	const limit = Math.floor(0xFFFFFFFF / max) * max;
	let n;
	do {
		n = crypto.randomBytes(4).readUInt32BE(0);
	} while (n >= limit);
	return n % max;
}

/** 만료된 발송 기록은 쌓아둘 필요가 없다 */
function sweepSendLog(now) {
	for (let [telno, entry] of sendLog) {
		if (now > entry.windowEndsAt) sendLog.delete(telno);
	}
}

module.exports = {
	CODE_TTL_MS: CODE_TTL_MS,
	MAX_ATTEMPTS: MAX_ATTEMPTS,

	/**
	 * 입력된 번호를 숫자만 남기고 국내 휴대폰 형식인지 확인한다.
	 * 형식이 아니면 null 을 돌려주므로 호출부는 null 검사로 거를 수 있다.
	 */
	normalizeTelno: function (raw) {
		if (raw === undefined || raw === null) return null;
		let digits = String(raw).replace(/[^0-9]/g, '');
		return /^01[016789][0-9]{7,8}$/.test(digits) ? digits : null;
	},

	/** 발송해도 되는 번호인지. 'ok' | 'cooldown' | 'too_many' */
	checkSendable: function (telno) {
		const now = Date.now();
		sweepSendLog(now);
		const entry = sendLog.get(telno);
		if (!entry) return 'ok';
		if (now - entry.lastSentAt < RESEND_COOLDOWN_MS) return 'cooldown';
		if (entry.count >= MAX_SENDS) return 'too_many';
		return 'ok';
	},

	registerSend: function (telno) {
		const now = Date.now();
		let entry = sendLog.get(telno);
		if (!entry || now > entry.windowEndsAt) {
			entry = { count: 0, windowEndsAt: now + SEND_WINDOW_MS, lastSentAt: 0 };
			sendLog.set(telno, entry);
		}
		entry.count += 1;
		entry.lastSentAt = now;
	},

	/**
	 * 발송이 실제로 실패했을 때 시간당 횟수만 되돌린다.
	 *
	 * 문자가 나가지 않았으니 한도를 깎을 이유가 없다. 다만 lastSentAt 은 그대로 둬서
	 * 30초 쿨다운은 유지한다. 실패가 반복될 때 재시도가 폭주하지 않게 하려는 것이고,
	 * 문자가 나가지 않는 실패는 남의 번호로 문자를 퍼붓는 수단이 되지 않는다.
	 */
	rollbackSend: function (telno) {
		let entry = sendLog.get(telno);
		if (entry && entry.count > 0) entry.count -= 1;
	},

	/**
	 * 6자리 인증번호. Math.random 은 예측 가능하므로 CSPRNG 를 쓴다.
	 *
	 * crypto.randomInt 는 Node 14.10 부터라서 운영 서버(Node 8)에서
	 * "crypto.randomInt is not a function" 으로 터진다. randomBytes 는
	 * 오래전부터 있으므로 그걸로 직접 균등 추출한다.
	 */
	generateCode: function () {
		return String(100000 + randomBelow(900000));
	},

	/**
	 * 세션에는 인증번호 원문을 두지 않는다. 세션 저장소가 노출되면 그대로
	 * 인증을 통과할 수 있기 때문이다. 번호를 섞어 해시해 두고 비교만 한다.
	 */
	hashCode: function (telno, code) {
		return crypto.createHash('sha256').update(telno + ':' + String(code)).digest('hex');
	},

	/** 타이밍 차이로 값을 추측하지 못하도록 고정시간 비교 */
	codeMatches: function (storedHash, telno, code) {
		if (!storedHash) return false;
		let given = module.exports.hashCode(telno, code);
		let a = Buffer.from(storedHash, 'utf8');
		let b = Buffer.from(given, 'utf8');
		return a.length === b.length && crypto.timingSafeEqual(a, b);
	},

	/**
	 * 숫자만 남은 번호를 USERS.TELNO_1~3 에 넣을 세 토막으로 나눈다.
	 * 11자리는 3-4-4, 10자리(011 등 구형 번호)는 3-3-4 로 끊는다.
	 */
	splitTelno: function (telno) {
		let mid = telno.length === 11 ? 7 : 6;
		return {
			telno1: telno.slice(0, 3),
			telno2: telno.slice(3, mid),
			telno3: telno.slice(mid)
		};
	},

	/** 세션에 남은 인증 완료 표시가 이 번호에 대해 아직 유효한지 */
	isVerified: function (cert, telno) {
		if (!cert || !cert.verifiedAt || cert.telno !== telno) return false;
		return (Date.now() - cert.verifiedAt) <= VERIFIED_TTL_MS;
	}
};
