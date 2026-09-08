/**
 * 로그인 (Vue 3) — MDBootstrap / Bootstrap / jQuery 미사용
 *
 * 기존 로직 유지:
 *  - 비밀번호는 sha256 후 전송 (서버 저장 방식이 동일하므로 변경 불가)
 *  - 실패 시 '로그인 정보가 정확하지 않습니다.'
 *  - 결제 진행 중 로그인한 경우(gubun=purchase) 원래 주문 파라미터로 복귀
 */
(function () {
    const el = function (id) { return document.getElementById(id); };
    const gubun = el('gubun') ? el('gubun').value : '';
    const paramRaw = el('param') ? el('param').value : '';

    const app = Vue.createApp({
        data() {
            return { telno: '', password: '', submitting: false };
        },

        methods: {
            async login() {
                if (isNull(this.telno)) { alert('휴대폰번호를 입력하세요.'); return; }
                if (isNull(this.password)) { alert('패스워드를 입력하세요.'); return; }
                if (this.submitting) return;

                this.submitting = true;
                const ret = await apiPost('/user/login', {
                    telno: this.telno,
                    password: sha256(this.password)
                });
                this.submitting = false;

                if (ret !== 'ok') {
                    alert('로그인 정보가 정확하지 않습니다.');
                    return;
                }
                this.afterLogin();
            },

            /** 결제 도중 로그인했다면 원래 주문 화면으로 파라미터를 들고 돌아간다 */
            afterLogin() {
                if (gubun !== 'purchase' || isNull(paramRaw)) {
                    location.href = '/';
                    return;
                }
                let p;
                try { p = JSON.parse(paramRaw); } catch (e) { location.href = '/'; return; }

                const parts = [];
                const add = function (k, v) { parts.push(k + '=' + encodeURIComponent(v == null ? '' : v)); };

                if (isNull(p.items)) {
                    add('itemNo', p.itemNo);
                    add('optionNo', p.optionNo);
                    add('optionNm', p.optionNm);
                    add('imagePath', p.imagePath);
                    add('itemNm', p.itemNm);
                    add('keepingMethod', p.keepingMethod);
                    add('itemPrice', p.itemPrice);
                    add('shippingFee', p.shippingFee);
                    add('itemPriceNum', p.itemPriceNum);
                    add('shippingFeeNum', p.shippingFeeNum);
                    add('qty', p.qty);
                } else {
                    add('items', p.items);
                }
                location.href = '/purchase?' + parts.join('&');
            },

            goSignUp() { location.href = '/user/sign_up'; },
            goFindPassword() { location.href = '/user/get_password'; }
        }
    });

    registerLayout(app);
    app.config.compilerOptions.delimiters = ['[[', ']]'];
    app.mount('#login_app');
})();
