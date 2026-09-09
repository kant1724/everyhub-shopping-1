/**
 * 공용 레이아웃 컴포넌트 (Vue 3) — MDBootstrap / Bootstrap / jQuery 없이 동작한다.
 *
 * 모든 페이지가 이 파일의 컴포넌트를 쓴다.
 *
 * 사용법:
 *   const app = Vue.createApp({ ... });
 *   registerLayout(app);            // <app-header> / <app-footer> 등록
 *   app.config.compilerOptions.delimiters = ['[[', ']]'];
 *   app.mount('#some_app');
 */

/** jQuery 없이 쓰는 폼 인코딩 POST. 서버는 x-www-form-urlencoded 를 기대한다. */
function apiPost(url, params) {
    const body = new URLSearchParams();
    Object.keys(params || {}).forEach(function (k) {
        const v = params[k];
        body.append(k, v === undefined || v === null ? '' : v);
    });

    return fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: body.toString()
    })
        .then(function (res) { return res.ok ? res.json() : { ret: [] }; })
        .then(function (data) { return data.ret; })
        .catch(function () { return null; });
}

/**
 * apiPost 와 같지만 응답 본문을 통째로 돌려준다.
 * 서버사이드 페이징처럼 ret 외에 totalCnt 같은 값이 함께 올 때 쓴다.
 */
function apiPostFull(url, params) {
    const body = new URLSearchParams();
    Object.keys(params || {}).forEach(function (k) {
        const v = params[k];
        body.append(k, v === undefined || v === null ? '' : v);
    });

    return fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: body.toString()
    })
        .then(function (res) { return res.ok ? res.json() : { ret: [], totalCnt: 0 }; })
        .catch(function () { return { ret: [], totalCnt: 0 }; });
}

/** 장바구니 담긴 건수. localStorage 를 못 읽는 환경(사파리 프라이빗 등)이면 0 */
function cartItemCount() {
    try {
        const raw = JSON.parse(localStorage.getItem('product'));
        return Array.isArray(raw) ? raw.length : 0;
    } catch (e) {
        return 0;
    }
}

/**
 * 장바구니가 바뀌었다고 헤더에 알린다.
 * storage 이벤트는 '다른 탭' 에서만 발생하므로, 같은 탭에서 담거나 뺐을 때는
 * 이 이벤트로 직접 알려야 배지가 즉시 따라온다.
 */
function notifyCartChanged() {
    window.dispatchEvent(new CustomEvent('cart-changed'));
}

/** 페이지가 서버에서 받은 세션 정보 (hidden input 으로 내려온다) */
function pageContext() {
    const el = function (id) { return document.getElementById(id); };
    return {
        userNo: el('user_no') ? el('user_no').value : '0',
        adminYn: el('admin_yn') ? el('admin_yn').value : 'N',
        itemNo: el('item_no') ? el('item_no').value : ''
    };
}

/**
 * 공용 헤더.
 *
 * 로고 줄과 메뉴 줄을 분리한 2단 구조다. 예전에는 추천상품·전체상품·농장소개가
 * 메인 페이지 히어로 안에만 있어서 다른 페이지에서는 갈 방법이 없었는데,
 * 이제 로고 아래 메뉴 줄에 들어가 어느 페이지에서나 쓸 수 있다.
 *
 * 데스크톱은 2단, 900px 이하에서는 한 줄 + 햄버거 서랍으로 접힌다.
 * 링크 목록은 한 곳(siteMenu/utilMenu)에서만 정의하고 두 곳에서 렌더한다.
 */
const AppHeader = {
    props: { userNo: { default: '0' }, adminYn: { default: 'N' } },
    data() {
        return { open: false, cartCount: cartItemCount() };
    },
    computed: {
        loggedIn() { return this.userNo && this.userNo !== '0'; },
        isAdmin() { return this.adminYn === 'Y'; },

        /** 세 자리가 넘으면 배지가 늘어나 아이콘을 가리므로 99+ 로 줄인다 */
        cartCountText() { return this.cartCount > 99 ? '99+' : String(this.cartCount); },

        /** 로고 아래 줄 — 쇼핑몰 주요 메뉴 */
        siteMenu() {
            return [
                { href: '/#recommend', label: '추천상품', anchor: '#recommend' },
                { href: '/#all_product', label: '전체상품', anchor: '#all_product' },
                { href: '/introduction', label: '농장소개' },
                { href: '/board/notice', label: '알림마당' },
                { href: '/#gallery', label: '갤러리', anchor: '#gallery' }
            ];
        },

        /** 로고 줄 오른쪽 — 장바구니·계정 */
        utilMenu() {
            // badge: 이 항목에만 건수 배지를 붙인다
            const cart = { href: '/cart', label: '장바구니', icon: 'fa-shopping-cart', badge: true };
            if (!this.loggedIn) {
                return [cart,
                    { href: '/user', label: '로그인', icon: 'fa-sign-in-alt' },
                    { href: '/user/sign_up', label: '회원가입', icon: 'fa-user-plus' }];
            }
            return [cart,
                { href: '/mypage', label: '마이페이지', icon: 'fa-user' },
                { href: 'javascript:void(0)', label: '로그아웃', icon: 'fa-sign-out-alt', action: 'logout' }];
        },

        adminMenu() {
            return [
                { href: '/admin/introduction_manager', label: '소개글관리' },
                { href: '/admin/gallery_manager', label: '갤러리관리' },
                { href: '/admin/item_manager', label: '상품관리' },
                { href: '/admin/order_list', label: '주문목록' },
                { href: '/admin/user_manager', label: '회원관리' },
                { href: '/admin/delivery_manager', label: '배송관리' }
            ];
        }
    },
    mounted() {
        this.syncCart = () => { this.cartCount = cartItemCount(); };
        this.syncCart();
        window.addEventListener('cart-changed', this.syncCart);   // 같은 탭에서 담기/빼기
        window.addEventListener('storage', this.syncCart);        // 다른 탭에서 바꿨을 때
        window.addEventListener('pageshow', this.syncCart);       // 뒤로가기(bfcache) 복원
    },

    unmounted() {
        window.removeEventListener('cart-changed', this.syncCart);
        window.removeEventListener('storage', this.syncCart);
        window.removeEventListener('pageshow', this.syncCart);
    },

    methods: {
        logout() { location.href = '/user/logout'; },

        /**
         * 메인 페이지 안에서는 부드럽게 스크롤하고, 다른 페이지에서는
         * /#recommend 처럼 메인으로 이동시킨다.
         */
        onNav(m, e) {
            if (m.action === 'logout') { e.preventDefault(); this.logout(); return; }
            if (m.anchor && location.pathname === '/') {
                const el = document.querySelector(m.anchor);
                if (el) {
                    e.preventDefault();
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
            this.open = false;
        }
    },
    template: `
        <header class="gd-header">
            <div class="gd-header-top">
                <div class="gd-header-inner">
                    <a class="gd-logo" href="/" aria-label="간드락닷컴 홈">
                        <svg class="gd-logo-mark" viewBox="0 0 40 40" width="32" height="32" aria-hidden="true" focusable="false">
                            <defs>
                                <linearGradient id="gdCitrus" x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0" stop-color="#ffc14d"/>
                                    <stop offset="1" stop-color="#f76707"/>
                                </linearGradient>
                            </defs>
                            <circle cx="20" cy="23.5" r="14" fill="url(#gdCitrus)"/>
                            <path d="M11.5 19.5 A 11 11 0 0 1 18.5 13.2" fill="none" stroke="#ffffff"
                                  stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/>
                            <path d="M20.6 10.4 C 22.4 4.2 28.8 2.2 32.6 2.6 C 33.2 6.9 30.2 12.2 24 11.9 Z"
                                  fill="#2f9e44"/>
                        </svg>
                        <span class="gd-logo-text"><b>간드락</b><span>닷컴</span></span>
                    </a>

                    <button type="button" class="gd-header-toggle" @click="open = !open" aria-label="메뉴">
                        <i class="far" :class="open ? 'fa-times' : 'fa-bars'"></i>
                    </button>

                    <nav class="gd-util">
                        <a class="gd-util-link" v-for="m in utilMenu" :key="m.label" :href="m.href"
                           @click="onNav(m, $event)">
                            <span class="gd-util-icon">
                                <i class="far" :class="m.icon"></i>
                                <span class="gd-cart-badge" v-if="m.badge && cartCount > 0"
                                      :aria-label="'담긴 상품 ' + cartCount + '건'">[[ cartCountText ]]</span>
                            </span>[[ m.label ]]</a>
                    </nav>
                </div>
            </div>

            <div class="gd-header-bottom">
                <div class="gd-header-inner">
                    <nav class="gd-sitenav">
                        <a class="gd-sitenav-link" v-for="m in siteMenu" :key="m.label" :href="m.href"
                           @click="onNav(m, $event)">[[ m.label ]]</a>

                        <template v-if="isAdmin">
                            <span class="gd-sitenav-divider"></span>
                            <a class="gd-sitenav-link gd-sitenav-admin" v-for="m in adminMenu" :key="m.href"
                               :href="m.href">[[ m.label ]]</a>
                        </template>
                    </nav>
                </div>
            </div>

            <nav class="gd-drawer" :class="{ 'is-open': open }">
                <a class="gd-drawer-link" v-for="m in siteMenu" :key="'s' + m.label" :href="m.href"
                   @click="onNav(m, $event)">[[ m.label ]]</a>
                <span class="gd-drawer-divider"></span>
                <a class="gd-drawer-link" v-for="m in utilMenu" :key="'u' + m.label" :href="m.href"
                   @click="onNav(m, $event)">
                    <span class="gd-util-icon">
                        <i class="far" :class="m.icon"></i>
                        <span class="gd-cart-badge" v-if="m.badge && cartCount > 0"
                              :aria-label="'담긴 상품 ' + cartCount + '건'">[[ cartCountText ]]</span>
                    </span>[[ m.label ]]</a>
                <template v-if="isAdmin">
                    <span class="gd-drawer-divider"></span>
                    <a class="gd-drawer-link gd-drawer-admin" v-for="m in adminMenu" :key="'a' + m.href"
                       :href="m.href">[[ m.label ]]</a>
                </template>
            </nav>
        </header>
    `
};

const AppFooter = {
    data() {
        return { seller: null };
    },
    mounted() {
        apiPost('/user/selectSellerInfo', { sellerNo: 1 }).then((ret) => {
            if (ret && ret.length > 0) this.seller = ret[0];
        });
    },
    template: `
        <footer class="gd-footer">
            <div class="gd-footer-inner">
                <p class="gd-footer-lead">숙기가 꽉찬 신선한 과일을 취급하는 간드락농원 입니다.</p>
                <a class="gd-footer-policy" href="/personal_information_policy">개인정보처리방침</a>

                <div class="gd-footer-info" v-if="seller">
                    <p>[[ seller.address ]]</p>
                    <p><i class="far fa-envelope"></i> [[ seller.email ]]</p>
                    <p>
                        휴대폰 <a :href="'tel:' + seller.telno">[[ seller.telno ]]</a>
                        <span class="gd-footer-sep">|</span> 전화 [[ seller.telno2 ]]
                    </p>
                    <p>FAX [[ seller.faxNo ]]</p>
                    <p>[[ seller.acno ]] <span class="gd-footer-sep">|</span> [[ seller.depositPersonNm ]]</p>
                    <p>통신판매업 [[ seller.mailOrderNo ]]</p>
                    <p>사업자번호 [[ seller.companyRegistrationNo ]]</p>
                </div>

                <p class="gd-footer-copy">© 2019 Copyright: Everyhub</p>
            </div>
        </footer>
    `
};

/**
 * 주소 검색 모달 — 결제 / 마이페이지 / 회원가입 공용.
 * juso.go.kr 도로명주소 API 를 그대로 사용한다 (엔드포인트·인증키 동일).
 *
 *   <address-search v-if="open" @close="open=false" @select="onPicked"></address-search>
 *   onPicked({ zipNo, addr })
 */
const AddressSearch = {
    emits: ['close', 'select'],
    data() {
        return { keyword: '', rows: [], page: 1, total: 0, gubun: 1, loading: false };
    },
    computed: {
        pageCount() { return Math.max(1, Math.ceil(Number(this.total) / 10)); }
    },
    methods: {
        search(gubun, page) {
            if (gubun) this.gubun = gubun;
            this.page = page || 1;
            if (!this.keyword || this.keyword.trim() === '') {
                alert('검색어를 입력하세요.');
                return;
            }
            this.loading = true;

            const url = 'http://www.juso.go.kr/addrlink/addrLinkApi.do'
                + '?currentPage=' + this.page
                + '&countPerPage=10'
                + '&keyword=' + encodeURIComponent(this.keyword)
                + '&confmKey=U01TX0FVVEgyMDE5MDIyODE5MzIxMTEwODU1MTA='
                + '&resultType=json';

            fetch(url)
                .then(function (r) { return r.json(); })
                .then((json) => {
                    this.loading = false;
                    if (!json.results || json.results.common.errorCode !== '0') {
                        alert('주소 검색에 실패했습니다. 잠시 후 다시 시도해 주세요.');
                        return;
                    }
                    this.total = Number(json.results.common.totalCount) || 0;
                    const seen = {};
                    const rows = [];
                    json.results.juso.forEach((j) => {
                        // 지번 검색은 중복 주소를 접는다 (기존 동작)
                        const addr = this.gubun === 1 ? j.jibunAddr : j.roadAddrPart1;
                        if (this.gubun === 1) {
                            if (seen[addr]) return;
                            seen[addr] = true;
                        }
                        rows.push({ addr: addr, zipNo: j.zipNo });
                    });
                    this.rows = rows;
                })
                .catch(() => {
                    this.loading = false;
                    alert('주소 검색 중 오류가 발생했습니다.');
                });
        },
        pick(row) { this.$emit('select', row); }
    },
    template: `
        <div class="gd-modal-backdrop" @click.self="$emit('close')">
            <div class="gd-modal gd-modal-wide">
                <div class="gd-modal-body">
                    <h2 class="gd-modal-title">주소검색</h2>
                    <input type="text" class="gd-input" v-model="keyword"
                           placeholder="예) 세종대로 209, 상암동 1595 (도로나 동까지만 입력)"
                           @keyup.enter="search(gubun, 1)">
                    <div class="gd-modal-actions">
                        <button type="button" class="gd-btn" @click="search(1, 1)">지번으로 조회</button>
                        <button type="button" class="gd-btn" @click="search(2, 1)">도로명으로 조회</button>
                    </div>

                    <table class="gd-table" v-if="rows.length > 0">
                        <thead><tr><th>주소</th><th>우편번호</th></tr></thead>
                        <tbody>
                            <tr v-for="(r, i) in rows" :key="i" @click="pick(r)">
                                <td>[[ r.addr ]]</td>
                                <td class="gd-table-zip">[[ r.zipNo ]]</td>
                            </tr>
                        </tbody>
                    </table>
                    <p class="gd-modal-empty" v-else>[[ loading ? '검색 중...' : '검색어를 입력하고 조회를 눌러주세요.' ]]</p>

                    <div class="gd-pager" v-if="rows.length > 0 && pageCount > 1">
                        <button type="button" @click="search(gubun, page - 1)" :disabled="page <= 1">&laquo;</button>
                        <span class="gd-pager-now">[[ page ]] / [[ pageCount ]]</span>
                        <button type="button" @click="search(gubun, page + 1)" :disabled="page >= pageCount">&raquo;</button>
                    </div>
                </div>
                <div class="gd-modal-footer">
                    <button type="button" class="gd-btn" @click="$emit('close')">닫기</button>
                </div>
            </div>
        </div>
    `
};

/** 앱에 공용 컴포넌트를 등록한다 */
/**
 * 목록 페이징 공용 컴포넌트.
 *
 *   <list-pager :total="rows.length" :page="page" :size="100"
 *               @change="page = $event"></list-pager>
 *
 * 페이지 번호는 1부터 센다. 페이지가 많아도 현재 위치 주변만 보여주고,
 * 처음/마지막으로 건너뛰는 버튼을 따로 둔다.
 */
const ListPager = {
    props: {
        total: { type: Number, default: 0 },
        page: { type: Number, default: 1 },
        size: { type: Number, default: 100 },
        window: { type: Number, default: 7 }
    },
    emits: ['change'],
    computed: {
        pageCount() { return Math.max(1, Math.ceil(this.total / this.size)); },

        /** 현재 페이지를 가운데 두고 최대 window 개의 번호만 노출한다 */
        pages() {
            const last = this.pageCount;
            const half = Math.floor(this.window / 2);
            let from = Math.max(1, this.page - half);
            let to = Math.min(last, from + this.window - 1);
            from = Math.max(1, to - this.window + 1);
            const list = [];
            for (let i = from; i <= to; i++) list.push(i);
            return list;
        },

        /** "1 - 100 / 630건" 처럼 지금 보고 있는 범위 */
        rangeText() {
            if (this.total === 0) return '0건';
            const start = (this.page - 1) * this.size + 1;
            const end = Math.min(this.total, this.page * this.size);
            return start + ' - ' + end + ' / 총 ' + numberWithCommas(this.total) + '건';
        }
    },
    methods: {
        go(p) {
            const next = Math.min(this.pageCount, Math.max(1, p));
            if (next !== this.page) this.$emit('change', next);
        }
    },
    template: `
        <div class="gd-pager" v-if="pageCount > 1">
            <button type="button" @click="go(1)" :disabled="page === 1" aria-label="첫 페이지">
                <i class="far fa-angle-double-left"></i>
            </button>
            <button type="button" @click="go(page - 1)" :disabled="page === 1" aria-label="이전">
                <i class="far fa-angle-left"></i>
            </button>

            <button type="button" v-for="p in pages" :key="p" @click="go(p)"
                    :class="{ 'is-now': p === page }">[[ p ]]</button>

            <button type="button" @click="go(page + 1)" :disabled="page === pageCount" aria-label="다음">
                <i class="far fa-angle-right"></i>
            </button>
            <button type="button" @click="go(pageCount)" :disabled="page === pageCount" aria-label="마지막 페이지">
                <i class="far fa-angle-double-right"></i>
            </button>

            <span class="gd-pager-now">[[ rangeText ]]</span>
        </div>
    `
};

function registerLayout(app) {
    app.component('app-header', AppHeader);
    app.component('app-footer', AppFooter);
    app.component('address-search', AddressSearch);
    app.component('list-pager', ListPager);
    return app;
}
