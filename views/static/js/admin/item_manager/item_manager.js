/**
 * 상품 관리 (Vue 3) — MDBootstrap / Bootstrap / jQuery 미사용
 * 기존 동작 유지: 목록 조회 / 옵션관리·변경 이동 / 삭제(확인 후)
 */
(function () {
    const ctx = pageContext();

    const app = Vue.createApp({
        data() {
            return { userNo: ctx.userNo, adminYn: ctx.adminYn, items: [], loading: true };
        },
        methods: {
            goNew() { location.href = '/admin/item_manager/item_new'; },
            goModify(it) { location.href = '/admin/item_manager/item_modify?itemNo=' + encodeURIComponent(it.itemNo); },
            goOption(it) { location.href = '/admin/item_manager/item_option?itemNo=' + encodeURIComponent(it.itemNo); },

            async load() {
                this.loading = true;
                this.items = (await apiPost('/admin/item_manager/selectItemList', {})) || [];
                this.loading = false;
            },

            async remove(it) {
                if (!confirm('해당 상품을 삭제하시겠습니까?')) return;
                await apiPost('/admin/item_manager/deleteItem', { itemNo: it.itemNo });
                alert('해당상품이 삭제되었습니다.');
                await this.load();
            }
        },
        async mounted() { await this.load(); }
    });

    registerLayout(app);
    app.config.compilerOptions.delimiters = ['[[', ']]'];
    app.mount('#item_mgr_app');
})();
