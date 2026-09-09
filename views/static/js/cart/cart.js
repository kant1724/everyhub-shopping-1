/**
 * 장바구니 (Vue 3) — MDBootstrap / Bootstrap / jQuery 미사용
 *
 * 기존 구현과 동일한 로직·데이터 계약을 유지한다.
 *  - localStorage 'product' 항목 구조 그대로 (id, optionNo, itemNo,
 *    itemPrice/itemPriceNum, shippingFee/shippingFeeNum, qty ...)
 *  - 구매하기는 /purchase?items=<id;id;...> 로 이동
 *  - 수량 0 이면 구매 불가
 *
 * 장바구니는 localStorage 에 계속 남아 있어서, 담을 때는 판매중이던 상품이
 * 그 사이 품절 / 출하전 / 판매중지로 바뀔 수 있다. 그래서 화면을 열 때
 * 현재 상품 상태를 다시 조회해 해당 상품에는 사유를 표시하고 선택 · 주문을 막는다.
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
                // itemNo -> 서버가 알려준 현재 상품 상태. 조회 전에는 비어 있다
                statusMap: {},
                statusLoaded: false,
                // checked 는 화면 전용 상태라 저장 시 제외한다
                items: loadProducts().map(function (p) {
                    return Object.assign({}, p, { qty: Number(p.qty) || 1, checked: true });
                })
            };
        },

        computed: {
            /** 주문 가능한(품절·출하전·판매중지가 아닌) 상품만 선택 대상이 된다 */
            buyableItems() {
                return this.items.filter((i) => this.isBuyable(i));
            },
            unavailableItems() {
                return this.items.filter((i) => !this.isBuyable(i));
            },
            checkedItems() {
                return this.buyableItems.filter(function (i) { return i.checked; });
            },
            checkedCount() { return this.checkedItems.length; },
            allChecked() {
                return this.buyableItems.length > 0 && this.checkedCount === this.buyableItems.length;
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

            /**
             * 주문할 수 없는 사유. 주문 가능하면 빈 문자열.
             * 상태를 아직 못 받았으면 판단을 보류한다 (없는 사유를 먼저 띄우지 않도록).
             * 관리자도 예외가 아니다 (상품 상세 · 주문서 · 서버 검증과 동일).
             */
            statusOf(item) {
                if (!this.statusLoaded) return '';
                const cur = this.statusMap[String(item.itemNo)];
                if (!cur) return '판매중지';                 // 삭제된 상품
                if (cur.soldOutYn === 'Y') return '품절';
                if (cur.shipYn !== 'Y') return '출하전';
                if (cur.useYn !== 'Y') return '판매중지';    // 노출만 내린 상품
                return '';
            },

            isBuyable(item) { return this.statusOf(item) === ''; },

            /**
             * 삭제되지 않은 상품 전체를 받아 장바구니 항목과 대조한다.
             * useYn 을 빼고 부르는 이유: 'Y' 로 거르면 품절이면서 노출을 내린
             * 상품이 목록에서 통째로 빠져 '판매중지' 로만 보인다.
             * 실제 사유(품절 / 출하전)를 그대로 알려주려면 전체를 받아야 한다.
             * (목록에 아예 없는 itemNo 는 삭제된 상품이다)
             */
            async loadItemStatus() {
                const list = (await apiPost('/admin/item_manager/selectItemList', {})) || [];
                const map = {};
                list.forEach(function (i) { map[String(i.itemNo)] = i; });
                this.statusMap = map;
                this.statusLoaded = true;
                // 주문할 수 없게 된 상품은 선택에서 빼 준다
                this.items.forEach((i) => { if (!this.isBuyable(i)) i.checked = false; });
            },

            lineTotal(item) {
                return (Number(item.itemPriceNum) + Number(item.shippingFeeNum)) * Number(item.qty);
            },

            increase(item) { item.qty = Number(item.qty) + 1; this.persist(); },

            decrease(item) {
                if (Number(item.qty) > 1) { item.qty = Number(item.qty) - 1; this.persist(); }
            },

            toggleAll(e) {
                const next = e.target.checked;
                this.items.forEach((i) => { i.checked = next && this.isBuyable(i); });
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
                    // checkedItems 가 이미 걸러 주지만, 상태 조회 실패 시를 대비한 최종 확인
                    const reason = this.statusOf(picked[i]);
                    if (reason !== '') {
                        alert(picked[i].itemNm + ' 상품은 ' + reason + ' 상태라 주문할 수 없습니다.');
                        return;
                    }
                }
                const items = picked.map(function (i) { return i.id; }).join(';');
                location.href = '/purchase?items=' + encodeURIComponent(items);
            }
        },

        async mounted() { await this.loadItemStatus(); }
    });

    registerLayout(app);
    app.config.compilerOptions.delimiters = ['[[', ']]'];
    app.mount('#cart_app');
})();
