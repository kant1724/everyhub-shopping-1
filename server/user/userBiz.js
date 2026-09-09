let userDao = require('./userDao');
let sms = require('../common/sms');
let phoneVerification = require('../common/phoneVerification');

/**
 * Password-reset guard.
 *
 * The certification code is a short numeric code, so it must not be
 * guessable and must not be brute-forceable:
 *  - codes are generated with a CSPRNG (not Math.random)
 *  - a code expires after CODE_TTL_MS
 *  - a phone number is locked out after MAX_ATTEMPTS wrong guesses
 * State is per-process and in memory, which is enough for a single
 * instance; move it to the DB/Redis if the app is ever scaled out.
 */
const CODE_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
const resetGuard = new Map();

function guardFor(telno) {
    let entry = resetGuard.get(telno);
    const now = Date.now();
    if (!entry || now > entry.windowEndsAt) {
        entry = { attempts: 0, windowEndsAt: now + ATTEMPT_WINDOW_MS, issuedAt: 0 };
        resetGuard.set(telno, entry);
    }
    return entry;
}

function codeIsFresh(telno) {
    const entry = resetGuard.get(telno);
    return !!entry && entry.issuedAt > 0 && (Date.now() - entry.issuedAt) <= CODE_TTL_MS;
}

function registerFailure(telno) {
    const entry = guardFor(telno);
    entry.attempts += 1;
    return entry.attempts;
}

function clearGuard(telno) {
    resetGuard.delete(telno);
}

module.exports = {
    /**
     * 회원가입 휴대폰 본인인증 - 인증번호 발송.
     *
     * 아직 가입 전이라 DB 에 인증번호를 둘 수 없으므로 발급 내역은 세션에 남기고,
     * 번호당 발송 제한만 phoneVerification 의 메모리에서 센다.
     * 이미 가입된 번호에는 보내지 않는다(남의 번호 확인 용도로도 쓰일 수 있다).
     *
     * callback: 'ok' | 'invalid' | 'dup' | 'cooldown' | 'too_many' | 'error'
     */
    sendSignUpCode: function(param, session, callback) {
        let telno = phoneVerification.normalizeTelno(param.telno);
        if (telno == null) {
            callback('invalid');
            return;
        }
        let sendable = phoneVerification.checkSendable(telno);
        if (sendable !== 'ok') {
            callback(sendable);
            return;
        }
        userDao.checkDup({ telno: telno }, (dup) => {
            // 조회 실패를 '가입 가능'으로 넘기면 안 되고, '이미 가입됨'으로
            // 알려서도 안 된다. 둘 다 사실이 아니므로 따로 돌려준다.
            if (dup === 'error') {
                callback('error');
                return;
            }
            if (dup !== 'ok') {
                callback('dup');
                return;
            }
            let certificationCode = phoneVerification.generateCode();
            // 30초 쿨다운을 먼저 걸어 동시 요청으로 문자가 여러 통 나가는 것을 막는다
            phoneVerification.registerSend(telno);
            let title = '인증번호 전송';
            let msg = '간드락농원 회원가입 인증번호는 ' + certificationCode + ' 입니다.';
            sms.sendSMS2(title, msg, telno, (result) => {
                if (!result.ok) {
                    // 문자가 나가지 않았으면 '전송했다'고 해서는 안 된다. 인증번호도
                    // 세션에 남기지 않는다(받지 못한 번호를 맞출 수는 없다).
                    // 실제로 발송되지 않았으므로 시간당 발송 횟수에서도 되돌린다.
                    phoneVerification.rollbackSend(telno);
                    callback('error');
                    return;
                }
                session.signUpCert = {
                    telno: telno,
                    codeHash: phoneVerification.hashCode(telno, certificationCode),
                    issuedAt: Date.now(),
                    attempts: 0,
                    verifiedAt: 0
                };
                callback('ok');
            });
        });
    },

    /**
     * 회원가입 휴대폰 본인인증 - 인증번호 확인.
     *
     * 통과하면 세션에 인증 완료 시각을 남기고 인증번호는 지운다(재사용 차단).
     *
     * callback: 'ok' | 'invalid' | 'expired' | 'too_many' | 'not ok'
     */
    confirmSignUpCode: function(param, session, callback) {
        let telno = phoneVerification.normalizeTelno(param.telno);
        if (telno == null) {
            callback('invalid');
            return;
        }
        let cert = session.signUpCert;
        if (!cert || cert.telno !== telno || !cert.codeHash) {
            callback('not ok');
            return;
        }
        if (cert.attempts >= phoneVerification.MAX_ATTEMPTS) {
            callback('too_many');
            return;
        }
        if (Date.now() - cert.issuedAt > phoneVerification.CODE_TTL_MS) {
            callback('expired');
            return;
        }
        if (phoneVerification.codeMatches(cert.codeHash, telno, param.certificationCode)) {
            cert.verifiedAt = Date.now();
            cert.codeHash = null;
            callback('ok');
        } else {
            cert.attempts += 1;
            callback('not ok');
        }
    },

    goSigningUp: function(param, callback) {
        userDao.insertUser(param, callback);
    },

    login: function(param, callback) {
        userDao.getPassword(param, (res) => {
            if (res == null || res.length == 0) {
                callback(null);
            } else if (param.password == res[0].password) {
                callback(res[0]);
            } else {
                callback(null);
            }
        });
    },

    selectUser: function(param, callback) {
        userDao.selectUser(param, callback);
    },

    selectAllUser: function(param, callback) {
        userDao.selectAllUser(param, callback);
    },

    selectAllUserCount: function(param, callback) {
        userDao.selectAllUserCount(param, callback);
    },

    selectSellerInfo: function(param, callback) {
        userDao.selectSellerInfo(param, callback);
    },

    getCertificationCode: function(param, callback) {
        const entry = guardFor(param.telno);
        if (entry.attempts >= MAX_ATTEMPTS) {
            callback('not ok');
            return;
        }
        userDao.getPassword(param, (res) => {
            if (res == null || res.length == 0) {
                callback('not ok');
            } else {
                // 6 digits from a cryptographically secure source.
                // crypto.randomInt 는 Node 14.10 부터여서 운영 서버(Node 8)에서
                // 터졌다. 회원가입 인증과 같은 생성기를 쓴다.
                let certificationCode = phoneVerification.generateCode();
                param.certificationCode = certificationCode;
                entry.issuedAt = Date.now();
                let telno = param.telno;
                let title = '인증번호 전송';
                let msg = '간드락농원 인증번호는 ' + certificationCode + ' 입니다.';
                sms.sendSMS2(title, msg, telno)
                userDao.updateCertificationCode(param);
                callback('ok');
            }
        });
    },

    confirmCertificationCode: function(param, callback) {
        const entry = guardFor(param.telno);
        if (entry.attempts >= MAX_ATTEMPTS || !codeIsFresh(param.telno)) {
            callback('not ok');
            return;
        }
        userDao.confirmCertificationCode(param, (ret) => {
            if (ret == null || ret.length == 0) {
                registerFailure(param.telno);
                callback('not ok');
            } else {
                let stored = ret[0].certificationCode;
                // reject empty/NULL stored codes outright so a blank guess never matches
                if (stored != null && String(stored) === String(param.certificationCode)) {
                    callback('ok');
                } else {
                    registerFailure(param.telno);
                    callback('not ok');
                }
            }
        });
    },

    modifyPassword: function(param, callback) {
        const entry = guardFor(param.telno);
        if (entry.attempts >= MAX_ATTEMPTS || !codeIsFresh(param.telno)) {
            callback('not ok');
            return;
        }
        userDao.modifyPassword(param, (ret) => {
            if (ret.affectedRows == 0) {
                registerFailure(param.telno);
                callback('not ok');
            } else {
                // burn the code so it cannot be replayed
                userDao.updateCertificationCode({ telno: param.telno, certificationCode: null });
                clearGuard(param.telno);
                callback('ok');
            }
        });
    }
};
