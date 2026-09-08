/**
 * 주문완료 (Vue 3) — MDBootstrap / Bootstrap / jQuery 미사용
 *
 * 기존 동작 유지:
 *  - 판매자 계좌 / 입금자명 표시
 *  - '재주문하기' 는 현재 쿼리스트링을 그대로 /purchase 로 넘긴다
 *  - '메인으로' 는 주문된 상품을 장바구니에서 제거한 뒤 이동
 *
 * ★ 버그 수정: 기존 코드는 location.href 를 먼저 실행하고 그 뒤에 장바구니를
 *   정리해서, 페이지 이동이 먼저 일어나면 주문한 상품이 장바구니에 남았다.
 *   지금은 정리를 끝낸 다음 이동한다.
 */
(function () {
    const ctx = pageContext();
    const params = new URLSearchParams(location.search);

    const app = Vue.createApp({
        data() {
            return {
                userNo: ctx.userNo,
                adminYn: ctx.adminYn,
                acno: '',
                depositPersonNm: ''
            };
        },

        methods: {
            /** 주문에 포함된 상품을 장바구니에서 제거 */
            clearOrderedFromCart() {
                const items = params.get('items');
                if (isNull(items)) return;

                let productArr = [];
                try {
                    const raw = JSON.parse(localStorage.getItem('product'));
                    if (Array.isArray(raw)) productArr = raw;
                } catch (e) { return; }

                const orderedIds = items.split(';').map(function (s) { return String(s); });
                const remain = productArr.filter(function (p) {
                    return orderedIds.indexOf(String(p.id)) === -1;
                });
                localStorage.setItem('product', JSON.stringify(remain));
            },

            goMain() {
                this.clearOrderedFromCart();   // 먼저 정리하고
                location.href = '/';           // 그 다음 이동
            },

            reorder() {
                const url = new URL(window.location.origin + '/purchase');
                url.search = params.toString();
                location.href = url.href;
            }
        },

        async mounted() {
            const ret = await apiPost('/user/selectSellerInfo', { sellerNo: 1 });
            if (ret && ret.length > 0) {
                this.acno = ret[0].acno || '';
                this.depositPersonNm = ret[0].depositPersonNm || '';
            }
        }
    });

    registerLayout(app);
    app.config.compilerOptions.delimiters = ['[[', ']]'];
    app.mount('#complete_app');
})();
