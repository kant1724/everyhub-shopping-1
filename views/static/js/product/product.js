/**
 * 상품 상세 (Vue 3) — MDBootstrap / Bootstrap / jQuery 미사용, PC·모바일 공용
 *
 * 기존 로직·데이터 계약 유지:
 *  - 장바구니 저장 구조(localStorage 'product')와 동일 옵션 중복 차단 규칙
 *  - '바로주문' 의 /purchase 쿼리스트링 파라미터
 *  - 출하전 / 품절 표시 및 구매 버튼 비활성 규칙 (관리자는 예외)
 *  - 후기 / Q&A 는 lastReviewNo · lastQnaNo · limit 로 배치 조회
 *
 * 통신은 fetch (vue-layout.js 의 apiPost), 델리미터는 [[ ]].
 */
(function () {
    const REVIEW_PER_PAGE = 15;
    const REVIEW_BATCH = 150;
    const QNA_PER_PAGE = 5;
    const QNA_BATCH = 50;

    const ctx = pageContext();

    const app = Vue.createApp({
        data() {
            return {
                itemNo: ctx.itemNo,
                userNo: ctx.userNo,
                adminYn: ctx.adminYn,

                item: null,
                images: [],
                options: [],
                selectedOptionNo: '',

                qty: 1,
                toast: '',
                toastTimer: null,

                tab: 'review',

                reviews: [],
                reviewPage: 0,
                reviewLastNo: 99999999,
                reviewHasMore: true,
                openedReviewNo: null,

                qnas: [],
                qnaPage: 0,
                qnaLastNo: 99999999,
                qnaHasMore: true,
                openedQnaNo: null,
                qnaReplies: {},

                qnaModalOpen: false,
                qnaForm: { subject: '', content: '' },
                replyText: ''
            };
        },

        computed: {
            isAdmin() { return this.adminYn === 'Y'; },
            loggedIn() { return this.userNo && this.userNo !== '0'; },

            selectedOption() {
                const no = String(this.selectedOptionNo);
                return this.options.find(function (o) { return String(o.optionNo) === no; }) || null;
            },

            usableOptions() {
                return this.options.filter(function (o) { return o.useYn !== 'N'; });
            },

            itemPriceNum() { return this.selectedOption ? Number(this.selectedOption.itemPrice) : 0; },
            shippingFeeNum() { return this.selectedOption ? Number(this.selectedOption.shippingFee) : 0; },
            itemPriceText() { return numberWithCommas(this.itemPriceNum) + '원'; },
            shippingFeeText() { return numberWithCommas(this.shippingFeeNum) + '원'; },
            totalPriceText() {
                return numberWithCommas((this.itemPriceNum + this.shippingFeeNum) * Number(this.qty)) + '원';
            },

            /**
             * 출하전 / 품절 — 관리자에게는 표시하지 않고 구매도 허용 (기존 규칙).
             * 품절이 출하 여부보다 우선한다. 출하중(SHIP_YN='Y')이면서 품절인
             * 상품이 '출하전' 으로 보이던 문제를 막기 위해 품절을 먼저 본다.
             */
            statusLabel() {
                if (!this.item || this.isAdmin) return '';
                if (this.item.soldOutYn === 'Y') return '품절';
                if (this.item.shipYn !== 'Y') return '출하전';
                return '';
            },

            /** 구매 버튼 아래에 띄우는 안내 문구 */
            statusNotice() {
                if (this.statusLabel === '') return '';
                return this.statusLabel === '품절'
                    ? '품절된 상품입니다. 재입고 후 주문하실 수 있습니다.'
                    : '아직 출하 전인 상품입니다. 출하가 시작되면 주문하실 수 있습니다.';
            },

            canBuy() { return !!this.item && !!this.selectedOption && this.statusLabel === ''; },

            descHtml() {
                if (!this.item || !this.item.itemDesc) return '';
                return escapeHtmlWithBreaks(this.item.itemDesc);
            },

            pagedReviews() {
                const s = this.reviewPage * REVIEW_PER_PAGE;
                return this.reviews.slice(s, s + REVIEW_PER_PAGE);
            },
            reviewPageCount() { return Math.max(1, Math.ceil(this.reviews.length / REVIEW_PER_PAGE)); },

            pagedQnas() {
                const s = this.qnaPage * QNA_PER_PAGE;
                return this.qnas.slice(s, s + QNA_PER_PAGE);
            },
            qnaPageCount() { return Math.max(1, Math.ceil(this.qnas.length / QNA_PER_PAGE)); }
        },

        methods: {
            /* ---------- 조회 ---------- */
            async loadItem() {
                const ret = await apiPost('/admin/item_manager/selectOneItem', { itemNo: this.itemNo });
                if (!ret || ret.length === 0) return;
                this.item = ret[0];
                const imgs = [];
                for (let i = 1; i <= 5; ++i) {
                    const path = ret[0]['imagePath' + i];
                    if (!isNull(path)) imgs.push(path);
                }
                this.images = imgs;
            },

            async loadOptions() {
                const ret = await apiPost('/admin/item_manager/selectItemOption', { itemNo: this.itemNo });
                this.options = ret || [];
                const first = this.options.find(function (o) { return o.useYn === 'Y'; }) || this.options[0];
                if (first) this.selectedOptionNo = first.optionNo;
            },

            async loadReviews() {
                const ret = await apiPost('/product/selectProductReviews', {
                    itemNo: this.itemNo,
                    lastReviewNo: this.reviewLastNo,
                    limit: REVIEW_BATCH
                });
                const rows = ret || [];
                if (rows.length > 0) {
                    this.reviews = this.reviews.concat(rows);
                    this.reviewLastNo = rows[rows.length - 1].reviewNo;
                }
                this.reviewHasMore = rows.length >= REVIEW_BATCH;
            },

            async loadQnas() {
                const ret = await apiPost('/product/selectQna', {
                    itemNo: this.itemNo,
                    lastQnaNo: this.qnaLastNo,
                    limit: QNA_BATCH
                });
                const rows = ret || [];
                if (rows.length > 0) {
                    this.qnas = this.qnas.concat(rows);
                    this.qnaLastNo = rows[rows.length - 1].qnaNo;
                }
                this.qnaHasMore = rows.length >= QNA_BATCH;
            },

            /* ---------- 페이징 ---------- */
            async goReviewPage(p) {
                if (p < 0) return;
                if (p >= this.reviewPageCount) {
                    if (!this.reviewHasMore) return;
                    await this.loadReviews();
                    if (p >= this.reviewPageCount) return;
                }
                this.reviewPage = p;
                this.openedReviewNo = null;
            },

            async goQnaPage(p) {
                if (p < 0) return;
                if (p >= this.qnaPageCount) {
                    if (!this.qnaHasMore) return;
                    await this.loadQnas();
                    if (p >= this.qnaPageCount) return;
                }
                this.qnaPage = p;
                this.openedQnaNo = null;
            },

            toggleReview(no) {
                this.openedReviewNo = this.openedReviewNo === no ? null : no;
            },

            async toggleQna(no) {
                if (this.openedQnaNo === no) { this.openedQnaNo = null; return; }
                this.openedQnaNo = no;
                this.replyText = '';
                const ret = await apiPost('/product/selectQnaReply', { qnaNo: no });
                this.qnaReplies[no] = ret || [];
            },

            stars(n) { return Number(n) || 0; },

            /* ---------- 수량 ---------- */
            increase() { this.qty = Number(this.qty) + 1; },
            decrease() { if (Number(this.qty) > 1) this.qty = Number(this.qty) - 1; },

            /* ---------- 장바구니 / 주문 ---------- */
            addCart() {
                if (!this.canBuy) return;
                let productArr = [];
                try {
                    const raw = JSON.parse(localStorage.getItem('product'));
                    if (Array.isArray(raw)) productArr = raw;
                } catch (e) { productArr = []; }

                let id = 0;
                for (let i = 0; i < productArr.length; ++i) {
                    // 같은 옵션이 이미 담겨 있으면 추가하지 않는다 (기존 규칙)
                    if (String(productArr[i].optionNo) === String(this.selectedOption.optionNo)) {
                        this.showToast('이미 장바구니에 있는 상품입니다. 장바구니에서 수량을 조정하세요.');
                        return;
                    }
                    id = Math.max(Number(productArr[i].id), id);
                }
                id += 1;

                productArr.push({
                    id: id,
                    optionNo: this.selectedOption.optionNo,
                    optionNm: this.selectedOption.optionNm,
                    itemNo: this.itemNo,
                    imagePath: this.images.length > 0 ? this.images[0] : '',
                    itemNm: this.item.itemNm,
                    keepingMethod: this.item.keepingMethod,
                    damageRemarks: this.item.damageRemarks,
                    itemPrice: this.itemPriceText,
                    shippingFee: this.shippingFeeText,
                    itemPriceNum: this.itemPriceNum,
                    shippingFeeNum: this.shippingFeeNum,
                    qty: this.qty
                });
                localStorage.setItem('product', JSON.stringify(productArr));
                this.showToast('상품이 장바구니에 추가되었습니다.');
            },

            orderNow() {
                if (!this.canBuy) return;
                if (Number(this.qty) === 0) { alert('수량은 1이상이어야 합니다.'); return; }
                const q = {
                    itemNo: this.itemNo,
                    optionNo: this.selectedOption.optionNo,
                    optionNm: this.selectedOption.optionNm,
                    imagePath: this.images.length > 0 ? this.images[0] : '',
                    itemNm: this.item.itemNm,
                    keepingMethod: this.item.keepingMethod,
                    itemPrice: this.itemPriceText,
                    shippingFee: this.shippingFeeText,
                    itemPriceNum: this.itemPriceNum,
                    shippingFeeNum: this.shippingFeeNum,
                    qty: this.qty
                };
                location.href = '/purchase?' + Object.keys(q).map(function (k) {
                    return k + '=' + encodeURIComponent(q[k] == null ? '' : q[k]);
                }).join('&');
            },

            showToast(msg) {
                this.toast = msg;
                clearTimeout(this.toastTimer);
                this.toastTimer = setTimeout(() => { this.toast = ''; }, 2200);
            },

            /* ---------- Q&A ---------- */
            openQnaModal() {
                if (!this.loggedIn) {
                    alert('로그인 후 이용해 주세요.');
                    location.href = '/user';
                    return;
                }
                this.qnaForm.subject = '';
                this.qnaForm.content = '';
                this.qnaModalOpen = true;
            },

            async submitQna() {
                if (isNull(this.qnaForm.subject)) { alert('제목을 입력하세요.'); return; }
                if (isNull(this.qnaForm.content)) { alert('내용을 입력하세요.'); return; }
                await apiPost('/product/writeQna', {
                    subject: this.qnaForm.subject,
                    content: this.qnaForm.content,
                    itemNo: this.itemNo
                });
                alert('질문이 등록되었습니다.');
                this.qnaModalOpen = false;
                this.qnas = [];
                this.qnaPage = 0;
                this.qnaLastNo = 99999999;
                this.qnaHasMore = true;
                await this.loadQnas();
            },

            async submitReply(qnaNo) {
                if (isNull(this.replyText)) { alert('내용을 입력하세요.'); return; }
                await apiPost('/product/writeQnaReply', { qnaNo: qnaNo, content: this.replyText });
                alert('답글이 등록되었습니다.');
                this.replyText = '';
                const ret = await apiPost('/product/selectQnaReply', { qnaNo: qnaNo });
                this.qnaReplies[qnaNo] = ret || [];
            },

            initSwiper() {
                new Swiper('.product-gallery', {
                    slidesPerView: 1,
                    loop: false,
                    pagination: { el: '.product-gallery .swiper-pagination', clickable: true },
                    navigation: {
                        prevEl: '.product-gallery .swiper-button-prev',
                        nextEl: '.product-gallery .swiper-button-next'
                    }
                });
            }
        },

        async mounted() {
            await this.loadItem();
            await this.loadOptions();
            await this.loadReviews();
            await this.loadQnas();

            // 이미지가 그려진 뒤에 Swiper 를 붙인다
            this.$nextTick(() => {
                if (this.images.length > 0) this.initSwiper();
            });
        }
    });

    registerLayout(app);
    app.config.compilerOptions.delimiters = ['[[', ']]'];
    app.mount('#product_app');
})();
