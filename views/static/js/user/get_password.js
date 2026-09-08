/**
 * 비밀번호 찾기 (Vue 3) — MDBootstrap / Bootstrap / jQuery 미사용
 *
 * 기존 3단계 흐름 유지:
 *   1) 휴대폰번호 입력 → 인증번호 전송
 *   2) 인증번호 확인
 *   3) 새 비밀번호 설정 (sha256 후 전송)
 *
 * 서버는 보안 조치 후 6자리 난수 · 5분 만료 · 5회 시도 제한이 적용되어 있다.
 */
(function () {
    const app = Vue.createApp({
        data() {
            return {
                step: 1,                 // 1: 번호입력, 2: 인증번호, 3: 새 비밀번호
                telno: '',
                certificationCode: '',
                password: '',
                passwordConfirm: '',
                busy: false
            };
        },

        methods: {
            async sendCode() {
                if (isNull(this.telno)) { alert('휴대폰번호를 입력하세요.'); return; }
                if (this.busy) return;
                this.busy = true;
                const ret = await apiPost('/user/getCertificationCode', { telno: this.telno });
                this.busy = false;

                if (ret === 'ok') {
                    alert('인증번호가 정상적으로 전송되었습니다.');
                    this.step = 2;
                } else {
                    alert('해당 휴대폰 번호로 가입된 정보가 없습니다.');
                }
            },

            async confirmCode() {
                if (isNull(this.certificationCode)) { alert('인증번호를 입력하세요.'); return; }
                if (this.busy) return;
                this.busy = true;
                const ret = await apiPost('/user/confirmCertificationCode', {
                    telno: this.telno,
                    certificationCode: this.certificationCode
                });
                this.busy = false;

                if (ret === 'ok') {
                    alert('인증이 완료되었습니다. 새로운 비밀번호를 입력하세요.');
                    this.step = 3;
                } else {
                    alert('인증번호가 잘못되었습니다. 다시 입력해 주세요.');
                }
            },

            async changePassword() {
                if (isNull(this.password)) { alert('패스워드를 입력하세요.'); return; }
                if (this.password !== this.passwordConfirm) {
                    alert('패스워드와 패스워드 확인이 다릅니다. 다시 확인해 주세요.');
                    return;
                }
                if (this.busy) return;
                this.busy = true;
                const ret = await apiPost('/user/modifyPassword', {
                    telno: this.telno,
                    certificationCode: this.certificationCode,
                    password: sha256(this.password)
                });
                this.busy = false;

                if (ret === 'ok') {
                    alert('비밀번호 변경에 성공하였습니다.');
                    location.href = '/user';
                } else {
                    alert('전화번호 또는 인증번호가 잘못되었습니다.');
                }
            }
        }
    });

    registerLayout(app);
    app.config.compilerOptions.delimiters = ['[[', ']]'];
    app.mount('#find_app');
})();
