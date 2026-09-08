/**
 * 상품 옵션 관리 (Vue 3) — MDBootstrap / Bootstrap / jQuery 미사용
 *
 * 서버 계약 (server/admin/item_manager/itemManagerSQL.xml) 그대로:
 *   selectItemOption(itemNo) / insertItemOption / updateItemOption / deleteItemOption(논리삭제)
 */
(function () {
    const ctx = pageContext();
    const el = document.getElementById('item_no');
    const itemNo = el ? el.value : '';

    const app = Vue.createApp({
        data() {
            return {
                userNo: ctx.userNo, adminYn: ctx.adminYn, itemNo: itemNo,
                rows: [], loading: true, modalOpen: false, saving: false,
                form: { optionNo: '', optionNm: '', itemPrice: '', shippingFee: '', useYn: 'Y', sortOrder: '0' }
            };
        },
        methods: {
            won(n) { return numberWithCommas(Number(n) || 0); },

            async load() {
                this.loading = true;
                this.rows = (await apiPost('/admin/item_manager/selectItemOption', { itemNo: this.itemNo })) || [];
                this.loading = false;
            },

            openNew() {
                this.form = { optionNo: '', optionNm: '', itemPrice: '', shippingFee: '', useYn: 'Y', sortOrder: '0' };
                this.modalOpen = true;
            },

            openEdit(r) {
                this.form = {
                    optionNo: r.optionNo,
                    optionNm: r.optionNm || '',
                    itemPrice: String(r.itemPrice == null ? '' : r.itemPrice),
                    shippingFee: String(r.shippingFee == null ? '' : r.shippingFee),
                    useYn: r.useYn === 'N' ? 'N' : 'Y',
                    sortOrder: String(r.sortOrder == null ? 0 : r.sortOrder)
                };
                this.modalOpen = true;
            },

            async save() {
                if (isNull(this.form.optionNm)) { alert('옵션명을 입력하세요.'); return; }
                if (isNull(this.form.itemPrice)) { alert('가격을 입력하세요.'); return; }
                if (isNull(this.form.shippingFee)) { alert('배송비를 입력하세요.'); return; }
                if (this.saving) return;
                this.saving = true;

                const isEdit = !isNull(this.form.optionNo);
                const payload = {
                    itemNo: this.itemNo,
                    optionNm: this.form.optionNm,
                    itemPrice: this.form.itemPrice,
                    shippingFee: this.form.shippingFee,
                    useYn: this.form.useYn,
                    sortOrder: isNull(this.form.sortOrder) ? 0 : this.form.sortOrder
                };
                if (isEdit) payload.optionNo = this.form.optionNo;

                await apiPost(isEdit ? '/admin/item_manager/updateItemOption'
                                     : '/admin/item_manager/insertItemOption', payload);
                this.saving = false;
                alert(isEdit ? '옵션이 변경되었습니다.' : '옵션이 등록되었습니다.');
                this.modalOpen = false;
                await this.load();
            },

            async remove(r) {
                if (!confirm('해당 옵션을 삭제하시겠습니까?')) return;
                await apiPost('/admin/item_manager/deleteItemOption', { itemNo: this.itemNo, optionNo: r.optionNo });
                alert('옵션이 삭제되었습니다.');
                await this.load();
            },

            goBack() { location.href = '/admin/item_manager/'; }
        },
        async mounted() { await this.load(); }
    });

    registerLayout(app);
    app.config.compilerOptions.delimiters = ['[[', ']]'];
    app.mount('#option_app');
})();
