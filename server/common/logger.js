/**
 * 서버 로그를 log/ 폴더에 파일로 남긴다.
 *
 * 그동안 로그는 콘솔에만 찍혀서, 터미널을 닫거나 서버를 재시작하면 사라졌다.
 * 문자 발송 실패나 DB 오류처럼 나중에 원인을 찾아야 하는 기록이 남지 않는다.
 *
 * 남는 파일 (날짜가 바뀌면 자동으로 새 파일):
 *   log/app-2026-09-09.log      - console.log / warn / error 전부
 *   log/access-2026-09-09.log   - HTTP 요청 기록 (morgan)
 *
 * 콘솔 출력은 그대로 유지한다. 개발 중에는 터미널로 보는 게 편하고,
 * 파일은 나중에 확인하기 위한 사본이다.
 *
 * 환경변수
 *   LOG_DIR             로그 폴더 (기본: 프로젝트 루트의 log)
 *   LOG_RETENTION_DAYS  이 일수보다 오래된 로그 파일 삭제 (기본 30, 0이면 삭제 안 함)
 */
let fs = require('fs');
let path = require('path');
let util = require('util');

const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, '..', '..', 'log');
const RETENTION_DAYS = process.env.LOG_RETENTION_DAYS === undefined
	? 30
	: parseInt(process.env.LOG_RETENTION_DAYS, 10);

// 원본 console 을 먼저 붙잡아 둔다. 아래에서 console 을 갈아끼우므로,
// 로그 자체가 실패했을 때 이걸로 알려야 무한 재귀에 빠지지 않는다.
const original = {
	log: console.log.bind(console),
	info: console.info.bind(console),
	warn: console.warn.bind(console),
	error: console.error.bind(console)
};

let streams = {};        // prefix -> { date, stream }
let dirReady = false;
let disabled = false;    // 폴더를 못 만들면 파일 기록만 포기하고 콘솔은 계속 쓴다
let activeDir = LOG_DIR; // 실제로 기록 중인 폴더 (LOG_DIR 이 막히면 임시폴더)

/** 'YYYY-MM-DD' (로컬 시간) */
function today() {
	let d = new Date();
	return d.getFullYear() + '-'
		+ String(d.getMonth() + 1).padStart(2, '0') + '-'
		+ String(d.getDate()).padStart(2, '0');
}

/** 'YYYY-MM-DD HH:mm:ss.SSS' (로컬 시간) */
function timestamp() {
	let d = new Date();
	return today() + ' '
		+ String(d.getHours()).padStart(2, '0') + ':'
		+ String(d.getMinutes()).padStart(2, '0') + ':'
		+ String(d.getSeconds()).padStart(2, '0') + '.'
		+ String(d.getMilliseconds()).padStart(3, '0');
}

function isDir(p) {
	try { return fs.statSync(p).isDirectory(); } catch (e) { return false; }
}

/**
 * 폴더를 만든다. 이미 폴더면 성공으로 본다.
 * 실패하면 왜 실패했는지를 문자열로 돌려준다(성공이면 null).
 */
function tryMakeDir(dir) {
	if (isDir(dir)) return null;
	try {
		fs.mkdirSync(dir, { recursive: true });
		return null;
	} catch (e) {
		// 이미 있으면 성공. 구버전 Node(10.12 미만)는 recursive 를 모르기 때문에
		// 폴더가 있어도 EEXIST 를 던진다.
		if (e.code === 'EEXIST') return isDir(dir) ? null : (e.code + ' (같은 이름의 파일이 있습니다)');
		try {
			fs.mkdirSync(dir);   // recursive 미지원 구버전 대비, 한 단계만 생성
			return null;
		} catch (e2) {
			return e2.code + ': ' + e2.message;
		}
	}
}

/**
 * 로그 폴더를 준비한다.
 *
 * 프로젝트의 log/ 를 만들지 못하면(권한 없음, 읽기전용 등) 기록을 통째로
 * 포기하지 말고 OS 임시폴더에라도 남긴다. 로그가 가장 필요한 순간은 서버가
 * 이상할 때인데, 그때 아무것도 안 남는 것이 제일 나쁘다.
 */
function ensureDir() {
	if (dirReady || disabled) return !disabled;

	let err = tryMakeDir(LOG_DIR);
	if (err === null) {
		dirReady = true;
		return true;
	}

	let fallback = path.join(require('os').tmpdir(), 'everyhub-shopping-log');
	let err2 = tryMakeDir(fallback);
	if (err2 === null) {
		original.error('[logger] 로그 폴더를 만들 수 없습니다: ' + LOG_DIR + ' -> ' + err);
		original.error('[logger] 쓰기 권한을 확인하거나 LOG_DIR 환경변수로 경로를 지정하세요.');
		original.error('[logger] 임시로 여기에 기록합니다: ' + fallback);
		activeDir = fallback;
		dirReady = true;
		return true;
	}

	disabled = true;
	original.error('[logger] 로그 폴더를 만들 수 없어 파일 기록을 끕니다.');
	original.error('[logger]   ' + LOG_DIR + ' -> ' + err);
	original.error('[logger]   ' + fallback + ' -> ' + err2);
	original.error('[logger] 쓰기 권한을 확인하거나 LOG_DIR 환경변수로 경로를 지정하세요.');
	return false;
}

/**
 * prefix 에 해당하는 오늘자 파일 스트림. 날짜가 바뀌면 이전 것을 닫고 새로 연다.
 */
function streamFor(prefix) {
	if (!ensureDir()) return null;
	let date = today();
	let cached = streams[prefix];
	if (cached && cached.date === date) return cached.stream;
	if (cached) cached.stream.end();

	try {
		let file = path.join(activeDir, prefix + '-' + date + '.log');
		let stream = fs.createWriteStream(file, { flags: 'a' });
		// 디스크가 차는 등으로 쓰기가 실패해도 서버가 죽어서는 안 된다
		stream.on('error', (err) => {
			original.error('[logger] 로그 기록 실패: ' + err.message);
		});
		streams[prefix] = { date: date, stream: stream };
		return stream;
	} catch (e) {
		original.error('[logger] 로그 파일을 열 수 없습니다: ' + e.message);
		return null;
	}
}

function writeLine(prefix, line) {
	let stream = streamFor(prefix);
	if (stream) stream.write(line);
}

/** console 인자들을 한 줄 문자열로. Error 는 스택까지 남긴다 */
function formatArgs(args) {
	return args.map(function (a) {
		if (a instanceof Error) return a.stack || (a.name + ': ' + a.message);
		if (typeof a === 'string') return a;
		return util.inspect(a, { depth: 4, breakLength: Infinity });
	}).join(' ');
}

/** 오래된 로그 파일 정리 */
function cleanOldLogs() {
	if (!Number.isFinite(RETENTION_DAYS) || RETENTION_DAYS <= 0) return;
	if (!ensureDir()) return;
	let cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
	try {
		fs.readdirSync(activeDir).forEach(function (name) {
			if (!/\.log$/.test(name)) return;
			let full = path.join(activeDir, name);
			try {
				if (fs.statSync(full).mtimeMs < cutoff) fs.unlinkSync(full);
			} catch (e) { /* 지우지 못해도 넘어간다 */ }
		});
	} catch (e) {
		original.error('[logger] 오래된 로그 정리 실패: ' + e.message);
	}
}

module.exports = {
	LOG_DIR: LOG_DIR,

	/** 실제로 기록 중인 폴더. 파일 기록이 꺼졌으면 null */
	activeDir: function () { return disabled ? null : activeDir; },

	/**
	 * console.log / info / warn / error 를 감싸서 파일에도 남기게 한다.
	 *
	 * 코드 18곳에 흩어진 console 호출을 일일이 고치지 않고 한 번에 담기 위한
	 * 방법이다. 콘솔 출력은 원래대로 유지된다.
	 * app.js 에서 한 번만 호출한다.
	 */
	captureConsole: function () {
		if (console.__loggerAttached) return;
		console.__loggerAttached = true;

		let wrap = function (level, originalFn) {
			return function () {
				let args = Array.prototype.slice.call(arguments);
				originalFn.apply(console, args);
				writeLine('app', '[' + timestamp() + '] [' + level + '] ' + formatArgs(args) + '\n');
			};
		};

		console.log = wrap('INFO', original.log);
		console.info = wrap('INFO', original.info);
		console.warn = wrap('WARN', original.warn);
		console.error = wrap('ERROR', original.error);

		cleanOldLogs();
		writeLine('app', '[' + timestamp() + '] [INFO] ===== 서버 시작 (pid ' + process.pid + ') =====\n');
		// 어디에 기록하는지 기동 로그에 남긴다. forever 로 띄웠을 때 이 한 줄만 보면
		// 파일이 어디 쌓이는지(또는 꺼졌는지) 바로 알 수 있다.
		if (disabled) original.error('[logger] 파일 기록이 꺼진 상태로 시작합니다 (콘솔만 출력)');
		else original.log('[logger] 로그 기록 위치: ' + activeDir);
	},

	/** morgan 에 넘길 스트림. HTTP 요청은 access-*.log 로 따로 모은다 */
	accessStream: {
		write: function (line) {
			writeLine('access', line);
		}
	}
};
