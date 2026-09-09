/**
 * 갤러리 관리 (Vue 3) — MDBootstrap / Bootstrap / jQuery 미사용
 *
 * 서버 계약 (server/admin/gallery_manager/galleryManagerDao.js) 주의:
 *   modifyGallery 는 imageN 이 'true' 인 슬롯만 경로를 저장하고,
 *   'false' 인 슬롯은 경로를 '' 로 만들어 버린다.
 *   → imageN 은 "새로 올렸는가" 가 아니라 "이 슬롯에 사진이 있는가" 라는 뜻이다.
 *     (기존 스크립트도 불러온 사진이 있으면 imageN 을 true 로 세팅했다)
 *   따라서 파일을 안 고른 슬롯도 기존 사진이 있으면 반드시 'true' 로 보내야 사진이 지워지지 않는다.
 *
 * 업로드는 "이번에 새로 고른 파일" 만 보낸다.
 *   (기존 스크립트는 파일이 없어도 업로드를 시도해 gallery_N.jpg 를 망가뜨릴 수 있었다)
 */
(function () {
    const REMOTE_URL = '211.253.9.176:5006';
    const UPLOAD_URL = 'http://' + REMOTE_URL + '/upload_image_from_shopping_1';

    const ctx = pageContext();

    const app = Vue.createApp({
        data() {
            return {
                userNo: ctx.userNo, adminYn: ctx.adminYn,
                loading: true, saving: false,
                slots: [1,2,3,4,5,6,7,8,9].map(function (n) {
                    return { n: n, url: '', desc: '', file: null, preview: '', removed: false };
                })
            };
        },
        methods: {
            async onPick(slot, e) {
                const f = e.target.files && e.target.files[0];
                if (!f) return;
                // 원본을 먼저 넣어 둔다. 리사이즈가 끝나기 전에 저장을 눌러도
                // 사진을 잃지 않고, 최악의 경우 예전처럼 원본이 올라갈 뿐이다.
                slot.file = f;
                slot.removed = false;

                const resized = await resizeImageFile(f);
                // 줄이는 동안 슬롯을 비웠거나 다른 파일을 골랐으면 덮어쓰지 않는다
                if (slot.file !== f) return;
                slot.file = resized;

                const reader = new FileReader();
                reader.onload = function () { slot.preview = reader.result; };
                reader.readAsDataURL(resized);
            },

            clearSlot(slot) {
                slot.file = null;
                slot.preview = '';
                slot.removed = true;
                const input = document.getElementById('gallery_image_' + slot.n);
                if (input) input.value = '';
            },

            shownImage(slot) {
                if (slot.preview) return slot.preview;
                if (!slot.removed && slot.url) return slot.url;
                return '';
            },

            /** 슬롯에 사진이 남아 있는지 = 서버로 보낼 imageN 플래그 */
            hasImage(slot) { return !!(slot.file || (!slot.removed && slot.url)); },

            async save() {
                if (this.saving) return;
                this.saving = true;

                const self = this;
                const payload = { remoteUrl: REMOTE_URL };
                this.slots.forEach(function (s) {
                    payload['image' + s.n] = self.hasImage(s) ? 'true' : 'false';
                    payload['imageDesc' + s.n] = s.desc;
                });

                await apiPost('/admin/gallery_manager/modifyGallery', payload);

                const jobs = [];
                this.slots.forEach(function (s) {
                    if (!s.file) return;                     // 새로 고른 파일만 올린다
                    const fd = new FormData();
                    fd.append('gallery_' + s.n, s.file);
                    jobs.push(fetch(UPLOAD_URL, { method: 'POST', body: fd }).catch(function () {}));
                });
                if (jobs.length > 0) await Promise.all(jobs);

                this.saving = false;
                alert('갤러리가 저장되었습니다.');
                location.reload();
            },

            async load() {
                const ret = await apiPost('/admin/gallery_manager/selectGalleryList', {});
                this.loading = false;
                if (!ret || ret.length === 0) return;
                const g = ret[0];
                this.slots.forEach(function (s) {
                    s.url = g['imagePath' + s.n] || '';
                    s.desc = g['imageDesc' + s.n] || '';
                });
            }
        },
        async mounted() { await this.load(); }
    });

    registerLayout(app);
    app.config.compilerOptions.delimiters = ['[[', ']]'];
    app.mount('#gallery_app');
})();
