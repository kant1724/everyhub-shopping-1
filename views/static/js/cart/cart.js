/**
 * 장바구니 (Vue 3) — MDBootstrap / Bootstrap / jQuery 미사용
 *
 * 기존 구현과 동일한 로직·데이터 계약을 유지한다.
 *  - localStorage 'product' 항목 구조 그대로 (id, optionNo, itemNo,
 *    itemPrice/itemPriceNum, shippingFee/shippingFeeNum, qty ...)
 *  - 구매하기는 /purchase?items=<id;id;...> 로 이동
 *  - 수량 0 이면 구매 불가
 *
 * Vue 델리미터는 [[ ]] (서버가 mustache 로 {{ }} 를 먼저 처리하므로).
 */
(function () {
    const STORAGE_KEY = 'product';

    function loadProducts() {
        try {
            const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return Array.isArray(raw) ? raw : [];
        } catch (e) {
            return [];
        }
    }

    const ctx = pageContext();

    const app = Vue.createApp({
        data() {
            return {
                userNo: ctx.userNo,
                adminYn: ctx.adminYn,
                // checked 는 화면 전용 상태라 저장 시 제외한다
                items: loadProducts().map(function (p) {
                    return Object.assign({}, p, { qty: Number(p.qty) || 1, checked: true });
                })
            };
        },

        computed: {
            checkedItems() {
                return this.items.filter(function (i) { return i.checked; });
            },
            checkedCount() { return this.checkedItems.length; },
            allChecked() {
                return this.items.length > 0 && this.checkedCount === this.items.length;
            },
            totalItemPrice() {
                return this.checkedItems.reduce(function (s, i) {
                    return s + Number(i.itemPriceNum) * Number(i.qty);
                }, 0);
            },
            totalShippingFee() {
                return this.checkedItems.reduce(function (s, i) {
                    return s + Number(i.shippingFeeNum) * Number(i.qty);
                }, 0);
            },
            totalPrice() { return this.totalItemPrice + this.totalShippingFee; }
        },

        methods: {
            formatWon(n) { return numberWithCommas(Number(n) || 0) + '원'; },

            lineTotal(item) {
                return (Number(item.itemPriceNum) + Number(item.shippingFeeNum)) * Number(item.qty);
            },

            increase(item) { item.qty = Number(item.qty) + 1; this.persist(); },

            decrease(item) {
                if (Number(item.qty) > 1) { item.qty = Number(item.qty) - 1; this.persist(); }
            },

            toggleAll(e) {
                const next = e.target.checked;
                this.items.forEach(function (i) { i.checked = next; });
            },

            removeItem(idx) { this.items.splice(idx, 1); this.persist(); },

            removeChecked() {
                this.items = this.items.filter(function (i) { return !i.checked; });
                this.persist();
            },

            /** 화면 전용 필드(checked)는 빼고 원래 구조 그대로 저장 */
            persist() {
                const payload = this.items.map(function (i) {
                    const copy = Object.assign({}, i);
                    delete copy.checked;
                    return copy;
                });
                localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
            },

            goPurchase() {
                const picked = this.checkedItems;
                if (picked.length === 0) { alert('구매할 상품을 선택하세요.'); return; }
                for (let i = 0; i < picked.length; ++i) {
                    if (Number(picked[i].qty) === 0) { alert('수량은 1이상이어야 합니다.'); return; }
                }
                const items = picked.map(function (i) { return i.id; }).join(';');
                location.href = '/purchase?items=' + encodeURIComponent(items);
            }
        }
    });

    registerLayout(app);
    app.config.compilerOptions.delimiters = ['[[', ']]'];
    app.mount('#cart_app');
})();
