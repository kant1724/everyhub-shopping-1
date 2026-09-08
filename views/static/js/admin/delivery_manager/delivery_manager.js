/**
 * 배송비 관리 (Vue 3) — MDBootstrap / Bootstrap / jQuery / jsGrid 미사용
 *
 * 기존 동작 유지:
 *  - lastShippingInfoNo + limit 로 배치 조회 (더보기)
 *  - 등록/수정은 같은 모달에서 처리 (shippingInfoNo 유무로 구분)
 *  - includingKeyword 는 해당 단어가 주소에 포함될 때만 추가배송비 적용
 */
(function () {
    const ctx = pageContext();
    const BATCH = 150;

    const app = Vue.createApp({
        data() {
            return {
                userNo: ctx.userNo,
                adminYn: ctx.adminYn,
                rows: [],
                lastNo: 99999999,
                hasMore: true,
                loading: true,
                modalOpen: false,
                saving: false,
                form: { shippingInfoNo: '', addr1: '', addr2: '', addr3: '', zipNo: '', shippingFee: '', includingKeyword: '' }
            };
        },
        methods: {
            won(n) { return numberWithCommas(Number(n) || 0); },

            async load(reset) {
                if (reset) { this.rows = []; this.lastNo = 99999999; this.hasMore = true; }
                this.loading = true;
                const ret = await apiPost('/admin/delivery_manager/selectShippingInfoList',
                    { lastShippingInfoNo: this.lastNo, limit: BATCH });
                const list = ret || [];
                if (list.length > 0) {
                    this.rows = this.rows.concat(list);
                    this.lastNo = list[list.length - 1].shippingInfoNo;
                }
                this.hasMore = list.length >= BATCH;
                this.loading = false;
            },

            openNew() {
                this.form = { shippingInfoNo: '', addr1: '', addr2: '', addr3: '', zipNo: '', shippingFee: '', includingKeyword: '' };
                this.modalOpen = true;
            },

            openEdit(r) {
                this.form = {
                    shippingInfoNo: r.shippingInfoNo,
                    addr1: r.addr1 || '', addr2: r.addr2 || '', addr3: r.addr3 || '',
                    zipNo: r.zipNo || '', shippingFee: r.shippingFee || '',
                    includingKeyword: r.includingKeyword || ''
                };
                this.modalOpen = true;
            },

            async save() {
                if (isNull(this.form.zipNo)) { alert('우편번호를 입력하세요.'); return; }
                if (isNull(this.form.shippingFee)) { alert('배송비를 입력하세요.'); return; }
                if (this.saving) return;
                this.saving = true;

                const isEdit = !isNull(this.form.shippingInfoNo);
                await apiPost(isEdit ? '/admin/delivery_manager/updateShippingInfo'
                                     : '/admin/delivery_manager/insertShippingInfo', this.form);
                this.saving = false;
                alert(isEdit ? '배송정보가 변경되었습니다.' : '배송정보가 등록되었습니다.');
                this.modalOpen = false;
                await this.load(true);
            },

            async remove(r) {
                if (!confirm('해당 배송정보를 삭제하시겠습니까?')) return;
                await apiPost('/admin/delivery_manager/deleteShippingInfo', { shippingInfoNo: r.shippingInfoNo });
                alert('배송정보가 삭제되었습니다.');
                await this.load(true);
            }
        },
        async mounted() { await this.load(true); }
    });

    registerLayout(app);
    app.config.compilerOptions.delimiters = ['[[', ']]'];
    app.mount('#delivery_app');
})();
