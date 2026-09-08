let moment = require('moment');
let crypto = require('crypto');
let userDao = require('./userDao');
let sms = require('../common/sms');

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

    checkDup: function(param, callback) {
        userDao.checkDup(param, callback);
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
                // 6 digits from a cryptographically secure source
                let certificationCode = crypto.randomInt(100000, 1000000);
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
