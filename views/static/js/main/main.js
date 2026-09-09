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
                galleryIndex: 0,
                photoOpen: false,      // 갤러리 사진 확대 보기
                photoIndex: 0
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
            /** 품절이 출하 여부보다 우선한다 (품절이면 출하중이라도 살 수 없다) */
            statusOf(item) {
                if (item.soldOutYn === 'Y') return '품절';
                return item.shipYn === 'Y' ? '판매중' : '출하전';
            },

            /** 주문할 수 없는 상품인지 — 칩을 흐리게 표시하는 데 쓴다 */
            isOff(item) { return item.soldOutYn === 'Y' || item.shipYn !== 'Y'; },

            descOf(item) {
                return item.itemDesc ? String(item.itemDesc).split('\n')[0] : '';
            },

            goProduct(itemNo) {
                location.href = '/product?itemNo=' + encodeURIComponent(itemNo);
            },

            goNotice(noticeNo) {
                location.href = '/board/notice/notice_detail?noticeNo=' + encodeURIComponent(noticeNo);
            },

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

            /**
             * 상단 배너.
             *
             * 이 화면은 Vue 런타임 컴파일러가 #main_app 의 기존 DOM 을 템플릿으로 삼아
             * 통째로 다시 그린다. 그래서 mounted 시작 시점에 바로 Swiper 를 만들면
             * 슬라이드를 0개로 측정해 드래그가 전혀 먹지 않았다.
             * $nextTick 으로 미뤄 실제 DOM 이 자리잡은 뒤 초기화한다.
             * (추천·갤러리 스와이퍼가 정상이었던 이유도 이미 $nextTick 안이었기 때문)
             *
             * observer 옵션은 이후 DOM 이 바뀌어도 스스로 다시 측정하게 하는 안전장치다.
             */
            initHeroSwiper() {
                new Swiper('.hero-swiper', {
                    slidesPerView: 1,
                    loop: true,                 // 마지막에서 처음으로 자연스럽게 이어진다
                    grabCursor: true,
                    observer: true,
                    observeParents: true,

                    // 기본값(longSwipesRatio 0.5)은 배너 폭이 넓을수록 불리하다.
                    // 1280px 배너라면 천천히 640px 이나 끌어야 넘어가서 "안 넘어간다" 고 느껴진다.
                    // 15% 만 끌어도 넘어가게 하고, 빠르게 튕기는 동작은 shortSwipes 가 받는다.
                    longSwipesRatio: 0.15,
                    longSwipesMs: 100,
                    shortSwipes: true,
                    followFinger: true,
                    threshold: 5,               // 미세한 흔들림은 무시해 클릭을 방해하지 않는다

                    autoplay: {
                        delay: 5000,
                        disableOnInteraction: false   // 손으로 넘긴 뒤에도 자동재생 계속
                    },
                    pagination: { el: '.hero-swiper .swiper-pagination', clickable: true },
                    navigation: {
                        prevEl: '.hero-swiper .swiper-button-prev',
                        nextEl: '.hero-swiper .swiper-button-next'
                    }
                });
            },

            /** 추천상품은 좌우 화살표 없이 드래그·스와이프로만 넘긴다 */
            initRecommendSwiper() {
                new Swiper('.rcm-swiper', {
                    slidesPerView: 'auto',
                    spaceBetween: 16,
                    loop: false,
                    grabCursor: true,
                    mousewheel: { forceToAxis: true }
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
            },

            /* ---------------- 갤러리 사진 확대 ---------------- */

            openPhoto(i) {
                this.photoIndex = i;
                this.photoOpen = true;
                // 확대 중에는 뒤쪽 페이지가 같이 스크롤되지 않게 막는다
                document.body.style.overflow = 'hidden';
            },

            closePhoto() {
                this.photoOpen = false;
                document.body.style.overflow = '';
            },

            prevPhoto() {
                if (this.gallery.length === 0) return;
                this.photoIndex = (this.photoIndex - 1 + this.gallery.length) % this.gallery.length;
            },

            nextPhoto() {
                if (this.gallery.length === 0) return;
                this.photoIndex = (this.photoIndex + 1) % this.gallery.length;
            },

            onPhotoKey(e) {
                if (!this.photoOpen) return;
                if (e.key === 'Escape') this.closePhoto();
                else if (e.key === 'ArrowLeft') this.prevPhoto();
                else if (e.key === 'ArrowRight') this.nextPhoto();
            },

            /**
             * 주소의 #앵커 위치로 옮긴다.
             *
             * 갤러리·추천상품 구역은 자료를 받아온 뒤에야 v-if 로 그려진다. 다른 화면에서
             * '/#gallery' 로 들어오면 브라우저가 위치를 잡으려는 시점에 그 요소가 아직
             * 없어서 아무 일도 일어나지 않는다. 그래서 다 그린 뒤에 직접 옮겨준다.
             */
            scrollToHash() {
                const hash = location.hash;
                if (!hash || hash.length < 2) return;
                const el = document.querySelector(hash);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        },

        async mounted() {
            // 배너는 DOM 이 자리잡은 뒤에 초기화해야 슬라이드를 제대로 잡는다
            this.$nextTick(() => this.initHeroSwiper());

            await this.loadItems();
            await this.loadNotices();
            await this.loadGallery();

            this.$nextTick(() => {
                if (this.recommended.length > 0) this.initRecommendSwiper();
                if (this.gallery.length > 0) this.initGallerySwiper();
                // 구역이 다 그려진 뒤라야 #gallery 같은 앵커를 찾을 수 있다
                this.scrollToHash();
            });

            window.addEventListener('keydown', this.onPhotoKey);
            // 다른 화면에서 이미 메인에 있는 상태로 갤러리 메뉴를 눌러도 옮겨가게 한다
            window.addEventListener('hashchange', this.scrollToHash);
        },

        unmounted() {
            window.removeEventListener('keydown', this.onPhotoKey);
            window.removeEventListener('hashchange', this.scrollToHash);
            document.body.style.overflow = '';
        }
    });

    registerLayout(app);
    app.config.compilerOptions.delimiters = ['[[', ']]'];
    app.mount('#main_app');
})();
