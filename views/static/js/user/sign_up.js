/**
 * 회원가입 (Vue 3) — MDBootstrap / Bootstrap / jQuery 미사용
 *
 * 기존 규칙 유지:
 *  - 검증 순서·문구 동일, 비밀번호는 sha256 후 전송
 *  - 개인정보처리방침 동의 필수
 *
 * 변경: 가입 전 '중복확인' 대신 휴대폰 본인인증을 받는다.
 *  - 인증번호 발송 시 서버가 가입 여부를 같이 확인하므로 중복확인을 겸한다
 *  - 인증번호는 5분간 유효하고, 확인 5회를 넘기면 재전송을 받아야 한다
 *  - 휴대폰번호를 고치면 인증은 처음부터 다시 받는다
 *  - 서버도 goSigningUp 에서 인증 여부를 다시 확인한다(화면 검사만으로는 못 막는다)
 */
(function () {
    const CODE_TTL_SEC = 300;     // 서버 phoneVerification.CODE_TTL_MS 와 맞춘다
    const RESEND_WAIT_SEC = 30;   // 서버 RESEND_COOLDOWN_MS 와 맞춘다

    const app = Vue.createApp({
        data() {
            return {
                form: {
                    telno1: '', telno2: '', telno3: '',
                    password: '', passwordConfirm: '',
                    userNm: '',
                    gender: '',
                    dateOfBirthY: '', dateOfBirthM: '', dateOfBirthD: '',
                    zipNo: '', addressMain: '', addressDetail: '',
                    agree: false
                },
                certificationCode: '',
                codeSent: false,
                telnoVerified: false,
                certNotice: '',         // 인증 영역에 보여줄 안내 문구
                secondsLeft: 0,         // 인증번호 남은 유효시간
                resendIn: 0,            // 재전송까지 남은 시간
                timer: null,
                busy: false,
                addressOpen: false,
                submitting: false
            };
        },

        computed: {
            telno() { return this.form.telno1 + this.form.telno2 + this.form.telno3; },

            /** 인증 버튼 문구: 처음 / 재전송(대기) / 완료 */
            sendBtnLabel() {
                if (this.telnoVerified) return '인증완료';
                if (this.resendIn > 0) return '재전송 ' + this.resendIn + '초';
                return this.codeSent ? '재전송' : '인증번호 받기';
            },

            timeLeftText() {
                if (this.secondsLeft <= 0) return '시간만료';
                const m = Math.floor(this.secondsLeft / 60);
                const s = this.secondsLeft % 60;
                return m + ':' + String(s).padStart(2, '0');
            },

            /** 남은 시간이 30초 이하면 타이머를 붉게 표시한다 */
            certUrgent() { return this.secondsLeft <= 30; },

            /** 휴대폰번호 아래 한 줄 안내 */
            certMessage() {
                if (this.telnoVerified) return '휴대폰 본인인증이 완료되었습니다.';
                if (this.certNotice) return this.certNotice;
                if (this.codeSent) return '전송된 인증번호를 입력해 주세요.';
                return '가입 전 휴대폰 본인인증이 필요합니다.';
            }
        },

        methods: {
            advance(e, len, nextRef) {
                if (String(e.target.value).length >= len && this.$refs[nextRef]) {
                    this.$refs[nextRef].focus();
                }
            },

            /** 번호가 바뀌면 인증을 처음부터 다시 받아야 한다 */
            onTelnoChanged() {
                if (!this.codeSent && !this.telnoVerified) return;
                this.resetCert();
            },

            resetCert() {
                this.codeSent = false;
                this.telnoVerified = false;
                this.certificationCode = '';
                this.certNotice = '';
                this.secondsLeft = 0;
                this.stopTimer();
            },

            startTimer() {
                this.stopTimer();
                this.timer = setInterval(() => {
                    if (this.secondsLeft > 0) this.secondsLeft -= 1;
                    if (this.resendIn > 0) this.resendIn -= 1;
                    if (this.secondsLeft <= 0 && this.resendIn <= 0) this.stopTimer();
                }, 1000);
            },

            stopTimer() {
                if (this.timer) { clearInterval(this.timer); this.timer = null; }
            },

            async sendCode() {
                if (this.telnoVerified || this.busy || this.resendIn > 0) return;
                if (isNull(this.form.telno1) || isNull(this.form.telno2) || isNull(this.form.telno3)) {
                    alert('휴대폰 번호를 정확히 입력하세요.');
                    return;
                }

                this.busy = true;
                const ret = await apiPost('/user/sendSignUpCode', { telno: this.telno });
                this.busy = false;

                if (ret === 'ok') {
                    this.codeSent = true;
                    this.certificationCode = '';
                    this.certNotice = '';
                    this.secondsLeft = CODE_TTL_SEC;
                    this.resendIn = RESEND_WAIT_SEC;
                    this.startTimer();
                    alert('인증번호가 전송되었습니다. 5분 안에 입력해 주세요.');
                    this.$nextTick(() => { if (this.$refs.code) this.$refs.code.focus(); });
                } else if (ret === 'invalid') {
                    alert('휴대폰 번호를 정확히 입력하세요.');
                } else if (ret === 'dup') {
                    alert('이미 가입된 휴대폰 번호입니다.');
                } else if (ret === 'cooldown') {
                    alert('인증번호를 방금 전송했습니다. 30초 후 다시 시도해 주세요.');
                } else if (ret === 'too_many') {
                    alert('인증번호 전송 횟수를 초과했습니다. 잠시 후 다시 시도해 주세요.');
                } else {
                    alert('인증번호 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.');
                }
            },

            async confirmCode() {
                if (this.busy || this.telnoVerified) return;
                if (isNull(this.certificationCode)) { alert('인증번호를 입력하세요.'); return; }

                this.busy = true;
                const ret = await apiPost('/user/confirmSignUpCode', {
                    telno: this.telno,
                    certificationCode: this.certificationCode
                });
                this.busy = false;

                if (ret === 'ok') {
                    this.telnoVerified = true;
                    this.certNotice = '';
                    this.stopTimer();
                    alert('휴대폰 본인인증이 완료되었습니다.');
                } else if (ret === 'expired') {
                    this.certNotice = '인증번호 유효시간이 지났습니다. 재전송해 주세요.';
                    this.secondsLeft = 0;
                    alert(this.certNotice);
                } else if (ret === 'too_many') {
                    this.certNotice = '인증번호 확인 횟수를 초과했습니다. 재전송해 주세요.';
                    this.secondsLeft = 0;
                    alert(this.certNotice);
                } else {
                    alert('인증번호가 일치하지 않습니다. 다시 입력해 주세요.');
                }
            },

            onAddressSelected(row) {
                this.form.zipNo = row.zipNo;
                this.form.addressMain = row.addr;
                this.addressOpen = false;
            },

            /** 기존 검증 순서·문구 그대로 */
            validate() {
                const f = this.form;
                if (isNull(f.telno1) || isNull(f.telno2) || isNull(f.telno3)) {
                    alert('휴대폰 번호를 정확히 입력하세요.'); return false;
                }
                if (isNull(f.password)) { alert('패스워드를 입력하세요.'); return false; }
                if (f.password !== f.passwordConfirm) { alert('비밀번호 확인을 정확히 입력하세요.'); return false; }
                if (isNull(f.userNm)) { alert('이름을 입력하세요.'); return false; }
                if (isNull(f.gender)) { alert('성별을 체크하세요.'); return false; }
                if (isNull(f.addressMain)) { alert('주소를 입력하세요.'); return false; }
                if (isNull(f.addressDetail)) { alert('상세주소를 입력하세요.'); return false; }
                if (isNull(f.zipNo)) { alert('주소를 입력하세요.'); return false; }
                if (!f.agree) { alert('개인정보처리방침에 동의해야 가입가능합니다.'); return false; }
                return true;
            },

            async signUp() {
                if (!this.telnoVerified) { alert('휴대폰 본인인증을 완료해주세요.'); return; }
                if (!this.validate()) return;
                if (this.submitting) return;

                this.submitting = true;
                const f = this.form;
                const ret = await apiPost('/user/goSigningUp', {
                    telno: this.telno,
                    telno1: f.telno1,
                    telno2: f.telno2,
                    telno3: f.telno3,
                    password: sha256(f.password),
                    userNm: f.userNm,
                    gender: f.gender,
                    dateOfBirth: String(f.dateOfBirthY) + String(f.dateOfBirthM) + String(f.dateOfBirthD),
                    dateOfBirthY: f.dateOfBirthY,
                    dateOfBirthM: f.dateOfBirthM,
                    dateOfBirthD: f.dateOfBirthD,
                    zipNo: f.zipNo,
                    addressMain: f.addressMain,
                    addressDetail: f.addressDetail
                });
                this.submitting = false;

                if (ret === 'not verified') {
                    // 인증 후 30분이 지났거나 세션이 끊긴 경우
                    this.resetCert();
                    alert('휴대폰 본인인증이 만료되었습니다. 인증을 다시 받아주세요.');
                    return;
                }
                if (ret === 'not ok') {
                    alert('이미 등록된 휴대폰 번호입니다.');
                    return;
                }
                alert('회원가입이 완료되었습니다.');
                location.href = '/user';
            }
        },

        beforeUnmount() { this.stopTimer(); }
    });

    registerLayout(app);
    app.config.compilerOptions.delimiters = ['[[', ']]'];
    app.mount('#signup_app');
})();
