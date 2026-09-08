/**
 * 회원가입 (Vue 3) — MDBootstrap / Bootstrap / jQuery 미사용
 *
 * 기존 규칙 유지:
 *  - 중복확인을 통과해야 가입 가능 (통과 전 '중복체크를 확인해주세요.')
 *  - 휴대폰번호를 고치면 중복확인은 다시 받아야 한다
 *  - 검증 순서·문구 동일, 비밀번호는 sha256 후 전송
 *  - 개인정보처리방침 동의 필수
 */
(function () {
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
                dupChecked: false,      // 기존 isDup 의 반대 개념
                addressOpen: false,
                submitting: false
            };
        },

        computed: {
            telno() { return this.form.telno1 + this.form.telno2 + this.form.telno3; }
        },

        methods: {
            advance(e, len, nextRef) {
                if (String(e.target.value).length >= len && this.$refs[nextRef]) {
                    this.$refs[nextRef].focus();
                }
            },

            /** 번호가 바뀌면 중복확인을 무효화한다 */
            onTelnoChanged() { this.dupChecked = false; },

            async checkDup() {
                if (isNull(this.telno)) { alert('휴대폰 번호를 입력하세요.'); return; }
                const ret = await apiPost('/user/checkDup', { telno: this.telno });
                if (ret === 'ok') {
                    alert('가입할 수 있는 휴대폰 번호입니다.');
                    this.dupChecked = true;
                } else {
                    alert('이미 가입된 휴대폰 번호입니다.');
                    this.dupChecked = false;
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
                if (!this.dupChecked) { alert('중복체크를 확인해주세요.'); return; }
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

                if (ret === 'not ok') {
                    alert('이미 등록된 휴대폰 번호입니다.');
                    return;
                }
                alert('회원가입이 완료되었습니다.');
                location.href = '/user';
            }
        }
    });

    registerLayout(app);
    app.config.compilerOptions.delimiters = ['[[', ']]'];
    app.mount('#signup_app');
})();
