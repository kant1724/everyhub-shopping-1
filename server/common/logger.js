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

function ensureDir() {
	if (dirReady || disabled) return !disabled;
	try {
		fs.mkdirSync(LOG_DIR, { recursive: true });
		dirReady = true;
		return true;
	} catch (e) {
		disabled = true;
		original.error('[logger] 로그 폴더를 만들 수 없어 파일 기록을 끕니다: ' + e.message);
		return false;
	}
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
		let file = path.join(LOG_DIR, prefix + '-' + date + '.log');
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
		fs.readdirSync(LOG_DIR).forEach(function (name) {
			if (!/\.log$/.test(name)) return;
			let full = path.join(LOG_DIR, name);
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
	},

	/** morgan 에 넘길 스트림. HTTP 요청은 access-*.log 로 따로 모은다 */
	accessStream: {
		write: function (line) {
			writeLine('access', line);
		}
	}
};
