/**
 * 메인 (Vue 3) — MDBootstrap / Bootstrap / jQuery 미사용, PC·모바일 공용
 *
 * 기존 로직 유지:
 *  - /admin/item_manager/selectItemList (useYn:'Y') 로 상품 조회
 *  - recommendYn === 'Y' 상품만 추천 영역에 노출
 *  - 공지 / 갤러리 조회 API 및 파라미터 동일
 *  - 상품 클릭 → /product?itemNo=..., 공지 클릭 → /board/notice/notice_detail?noticeNo=...
 *
 * 통신은 fetch (vue-layout.js 의 apiPost), 델리미터는 [[ ]].
 */
(function () {
    const ctx = pageContext();

    const app = Vue.createApp({
        data() {
            return {
                userNo: ctx.userNo,
                adminYn: ctx.adminYn,
                items: [],
                notices: [],
                gallery: [],
                galleryDescs: [],
                galleryIndex: 0
            };
        },

        computed: {
            recommended() {
                return this.items.filter(function (i) { return i.recommendYn === 'Y'; });
            },
            galleryDesc() {
                return this.galleryDescs[this.galleryIndex] || '';
            }
        },

        methods: {
            statusOf(item) { return item.shipYn === 'Y' ? '판매중' : '출하전'; },

            descOf(item) {
                return item.itemDesc ? String(item.itemDesc).split('\n')[0] : '';
            },

            goProduct(itemNo) {
                location.href = '/product?itemNo=' + encodeURIComponent(itemNo);
            },

            goNotice(noticeNo) {
                location.href = '/board/notice/notice_detail?noticeNo=' + encodeURIComponent(noticeNo);
            },

            goCart() { location.href = '/cart'; },

            scrollTo(hash) {
                const el = document.querySelector(hash);
                if (!el) return;
                window.scrollTo({
                    top: el.getBoundingClientRect().top + window.pageYOffset - 70,
                    behavior: 'smooth'
                });
            },

            async loadItems() {
                this.items = (await apiPost('/admin/item_manager/selectItemList', { useYn: 'Y' })) || [];
            },

            async loadNotices() {
                const ret = (await apiPost('/board/notice/selectNoticeList', {})) || [];
                this.notices = ret.slice(0, 5);
            },

            async loadGallery() {
                const ret = (await apiPost('/admin/gallery_manager/selectGalleryList', {})) || [];
                if (ret.length === 0) return;
                const row = ret[0];
                const imgs = [];
                const descs = [];
                for (let i = 1; i <= 9; ++i) {
                    const url = row['imagePath' + i];
                    if (!isNull(url)) {
                        imgs.push(url);
                        descs.push(row['imageDesc' + i] || '');
                    }
                }
                this.gallery = imgs;
                this.galleryDescs = descs;
            },

            initHeroSwiper() {
                new Swiper('.hero-swiper', {
                    autoplay: { delay: 5000 },
                    slidesPerView: 1,
                    loop: false,
                    pagination: { el: '.hero-swiper .swiper-pagination', clickable: true },
                    navigation: {
                        prevEl: '.hero-swiper .swiper-button-prev',
                        nextEl: '.hero-swiper .swiper-button-next'
                    }
                });
            },

            initRecommendSwiper() {
                new Swiper('.rcm-swiper', {
                    slidesPerView: 'auto',
                    spaceBetween: 16,
                    loop: false,
                    navigation: {
                        prevEl: '.rcm-swiper .swiper-button-prev',
                        nextEl: '.rcm-swiper .swiper-button-next'
                    }
                });
            },

            initGallerySwiper() {
                const self = this;
                const top = new Swiper('.gallery-swiper', {
                    spaceBetween: 10,
                    loop: false,
                    navigation: {
                        prevEl: '.gallery-swiper .swiper-button-prev',
                        nextEl: '.gallery-swiper .swiper-button-next'
                    }
                });
                top.on('slideChange', function () { self.galleryIndex = top.activeIndex; });
            }
        },

        async mounted() {
            this.initHeroSwiper();

            await this.loadItems();
            await this.loadNotices();
            await this.loadGallery();

            this.$nextTick(() => {
                if (this.recommended.length > 0) this.initRecommendSwiper();
                if (this.gallery.length > 0) this.initGallerySwiper();
            });
        }
    });

    registerLayout(app);
    app.config.compilerOptions.delimiters = ['[[', ']]'];
    app.mount('#main_app');
})();
