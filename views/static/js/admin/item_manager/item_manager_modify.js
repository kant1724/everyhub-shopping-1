/**
 * 상품 등록 / 수정 (Vue 3) — MDBootstrap / Bootstrap / jQuery 미사용
 *
 * 서버 계약을 그대로 지킨다 (server/admin/item_manager/itemManagerDao.js):
 *   image1..6 : 이번에 "새 파일을 올렸는가"  → true 면 서버가 경로를 새로 쓴다
 *   remove1..6: 기존 이미지를 "지웠는가"     → true 면 서버가 경로를 '' 로 만든다
 *   둘 다 false 면 updateImagePath 의 ELSE 분기로 기존 경로가 유지된다
 *
 * 저장 후 새 itemNo(등록) 또는 기존 itemNo(수정) 로 파일을 업로드 서버에 전송한다.
 *   POST http://{remoteUrl}/upload_image_from_shopping_1, 필드명 "{itemNo}_{n}"
 *
 * 상품설명 100자 제한 검증도 그대로 유지.
 */
(function () {
    const REMOTE_URL = '211.253.9.176:5006';
    const UPLOAD_URL = 'http://' + REMOTE_URL + '/upload_image_from_shopping_1';

    const ctx = pageContext();
    const el = document.getElementById('item_no');
    const itemNo = el ? el.value : '';
    const isEdit = !isNull(itemNo);

    const app = Vue.createApp({
        data() {
            return {
                userNo: ctx.userNo, adminYn: ctx.adminYn,
                isEdit: isEdit, itemNo: itemNo,
                loading: isEdit, saving: false,
                errors: { itemNm: '', itemDesc: '' },

                mainCtgrList: [{ cd: '1', nm: '과일' }, { cd: '2', nm: '야채' }],
                midCtgrList: [{ cd: '1', nm: '한라봉' }, { cd: '2', nm: '천혜향' }, { cd: '3', nm: '레드향' },
                              { cd: '4', nm: '황금향' }, { cd: '5', nm: '카라향' }, { cd: '6', nm: '진지향' }],
                originList: [{ cd: '1', nm: '국내산' }],

                form: {
                    itemNm: '', itemMainCtgrCd: '', itemMidCtgrCd: '', originCd: '1',
                    itemDesc: '', notice: '', keepingMethod: '', damageRemarks: '',
                    recommendYn: 'N', useYn: 'Y', shipYn: 'N', soldOutYn: 'N', sortOrder: '0'
                },

                slots: [1, 2, 3, 4, 5, 6].map(function (n) {
                    return { n: n, url: '', file: null, preview: '', removed: false };
                })
            };
        },
        methods: {
            onPick(slot, e) {
                const f = e.target.files && e.target.files[0];
                if (!f) return;
                slot.file = f;
                slot.removed = false;
                const reader = new FileReader();
                reader.onload = function () { slot.preview = reader.result; };
                reader.readAsDataURL(f);
            },

            clearSlot(slot) {
                slot.file = null;
                slot.preview = '';
                slot.removed = true;
                const input = document.getElementById('item_image_' + slot.n);
                if (input) input.value = '';
            },

            shownImage(slot) {
                if (slot.preview) return slot.preview;
                if (!slot.removed && slot.url) return slot.url;
                return '';
            },

            /** 기존 검증 규칙 그대로 (상품설명 100자 제한 포함) */
            validate() {
                let ok = true;
                this.errors.itemNm = '';
                this.errors.itemDesc = '';
                if (isNull(this.form.itemNm)) { this.errors.itemNm = '상품명을 입력하세요.'; ok = false; }
                if (isNull(this.form.itemDesc)) { this.errors.itemDesc = '상품설명을 입력하세요.'; ok = false; }
                else if (String(this.form.itemDesc).length > 100) {
                    this.errors.itemDesc = '상품설명은 100자를 초과할 수 없습니다.'; ok = false;
                }
                return ok;
            },

            async uploadImages(savedItemNo) {
                const jobs = [];
                this.slots.forEach(function (s) {
                    if (!s.file) return;                     // 새로 고른 파일만 올린다
                    const fd = new FormData();
                    fd.append(savedItemNo + '_' + s.n, s.file);
                    jobs.push(fetch(UPLOAD_URL, { method: 'POST', body: fd }).catch(function () {}));
                });
                if (jobs.length > 0) await Promise.all(jobs);
            },

            async save() {
                if (!this.validate()) return;
                if (this.saving) return;
                this.saving = true;

                const f = this.form;
                const payload = {
                    itemNm: f.itemNm,
                    itemMainCtgrCd: f.itemMainCtgrCd,
                    itemMidCtgrCd: f.itemMidCtgrCd,
                    originCd: f.originCd,
                    itemDesc: f.itemDesc,
                    notice: f.notice,
                    keepingMethod: f.keepingMethod,
                    damageRemarks: f.damageRemarks,
                    recommendYn: f.recommendYn,
                    useYn: f.useYn,
                    shipYn: f.shipYn,
                    soldOutYn: f.soldOutYn,
                    sortOrder: isNull(f.sortOrder) ? 0 : f.sortOrder,
                    remoteUrl: REMOTE_URL
                };
                if (this.isEdit) payload.itemNo = this.itemNo;
                this.slots.forEach(function (s) {
                    payload['image' + s.n] = s.file ? 'true' : 'false';
                    payload['remove' + s.n] = s.removed ? 'true' : 'false';
                });

                const ret = await apiPost(this.isEdit ? '/admin/item_manager/modifyItem'
                                                      : '/admin/item_manager/registerNewItem', payload);
                // 신규 등록이면 서버가 새 itemNo 를 돌려준다
                const savedItemNo = this.isEdit ? this.itemNo : ret;
                await this.uploadImages(savedItemNo);

                this.saving = false;
                alert(this.isEdit ? '상품이 변경되었습니다.' : '상품이 등록되었습니다.');
                location.href = '/admin/item_manager/';
            },

            async load() {
                const ret = await apiPost('/admin/item_manager/selectOneItem', { itemNo: this.itemNo });
                this.loading = false;
                if (!ret || ret.length === 0) return;
                const it = ret[0];
                const f = this.form;
                f.itemNm = it.itemNm || '';
                f.itemMainCtgrCd = it.itemMainCtgrCd == null ? '' : String(it.itemMainCtgrCd);
                f.itemMidCtgrCd = it.itemMidCtgrCd == null ? '' : String(it.itemMidCtgrCd);
                f.originCd = it.originCd == null ? '1' : String(it.originCd);
                f.itemDesc = it.itemDesc || '';
                f.notice = it.notice || '';
                f.keepingMethod = it.keepingMethod || '';
                f.damageRemarks = it.damageRemarks || '';
                f.recommendYn = it.recommendYn === 'Y' ? 'Y' : 'N';
                f.useYn = it.useYn === 'Y' ? 'Y' : 'N';
                f.shipYn = it.shipYn === 'Y' ? 'Y' : 'N';
                f.soldOutYn = it.soldOutYn === 'Y' ? 'Y' : 'N';
                f.sortOrder = String(it.sortOrder == null ? 0 : it.sortOrder);

                this.slots.forEach(function (s) { s.url = it['imagePath' + s.n] || ''; });
            },

            goBack() { location.href = '/admin/item_manager/'; }
        },
        async mounted() { if (this.isEdit) await this.load(); }
    });

    registerLayout(app);
    app.config.compilerOptions.delimiters = ['[[', ']]'];
    app.mount('#item_form_app');
})();
