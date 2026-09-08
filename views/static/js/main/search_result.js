/**
 * 검색결과 (Vue 3) — MDBootstrap / Bootstrap / jQuery 미사용
 *
 * 버그 수정: 기존 코드는 존재하지 않는 API
 * (/admin/product_manager/selectProductList) 를 호출해서 검색 페이지가
 * 항상 응답 없이 멈춰 있었다. 실제 상품 조회 API 로 교체한다.
 */
(function () {
    const ctx = pageContext();
    const el = document.getElementById("query");
    const query = el ? el.value : "";

    const app = Vue.createApp({
        data() {
            return { userNo: ctx.userNo, adminYn: ctx.adminYn, query: query, items: [], loading: true };
        },
        methods: {
            statusOf(item) { return item.shipYn === "Y" ? "판매중" : "출하전"; },
            descOf(item) { return item.itemDesc ? String(item.itemDesc).split("\n")[0] : ""; },
            goProduct(itemNo) { location.href = "/product?itemNo=" + encodeURIComponent(itemNo); }
        },
        async mounted() {
            // 판매중 상품 중 상품명에 검색어가 포함된 것 (SQL 이 itemNm LIKE 지원)
            this.items = (await apiPost("/admin/item_manager/selectItemList",
                { useYn: "Y", itemNm: this.query })) || [];
            this.loading = false;
        }
    });

    registerLayout(app);
    app.config.compilerOptions.delimiters = ["[[", "]]"];
    app.mount("#search_app");
})();
