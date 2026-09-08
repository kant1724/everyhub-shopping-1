/**
 * 공용 레이아웃 컴포넌트 (Vue 3) — MDBootstrap / Bootstrap / jQuery 없이 동작한다.
 *
 * 레거시 header.js · footer.js 는 jQuery + MDB 네비게이션에 의존하므로,
 * Vue 로 전환된 페이지는 이 파일의 컴포넌트를 대신 사용한다.
 * 아직 전환되지 않은 페이지는 기존 파일을 계속 쓰므로 서로 영향이 없다.
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

/** 페이지가 서버에서 받은 세션 정보 (hidden input 으로 내려온다) */
function pageContext() {
    const el = function (id) { return document.getElementById(id); };
    return {
        userNo: el('user_no') ? el('user_no').value : '0',
        adminYn: el('admin_yn') ? el('admin_yn').value : 'N',
        itemNo: el('item_no') ? el('item_no').value : ''
    };
}

const AppHeader = {
    props: { userNo: { default: '0' }, adminYn: { default: 'N' } },
    data() {
        return { open: false };
    },
    computed: {
        loggedIn() { return this.userNo && this.userNo !== '0'; },
        isAdmin() { return this.adminYn === 'Y'; },
        adminMenu() {
            return [
                { href: '/admin/introduction_manager', label: '소개글관리' },
                { href: '/board/notice', label: '알림마당' },
                { href: '/admin/gallery_manager', label: '갤러리관리' },
                { href: '/admin/item_manager', label: '상품관리' },
                { href: '/admin/order_list', label: '주문목록' },
                { href: '/admin/user_manager', label: '회원관리' },
                { href: '/admin/delivery_manager', label: '배송관리' }
            ];
        }
    },
    methods: {
        logout() { location.href = '/user/logout'; }
    },
    template: `
        <header class="gd-header">
            <div class="gd-header-inner">
                <a class="gd-logo" href="/">간드락닷컴</a>

                <button type="button" class="gd-header-toggle" @click="open = !open" aria-label="메뉴">
                    <i class="far" :class="open ? 'fa-times' : 'fa-bars'"></i>
                </button>

                <nav class="gd-nav" :class="{ 'is-open': open }">
                    <a class="gd-nav-link" href="/cart"><i class="far fa-shopping-cart"></i>장바구니</a>

                    <template v-if="!loggedIn">
                        <a class="gd-nav-link" href="/user"><i class="far fa-sign-in-alt"></i>로그인</a>
                        <a class="gd-nav-link" href="/user/sign_up"><i class="far fa-user-plus"></i>회원가입</a>
                    </template>
                    <template v-else>
                        <a class="gd-nav-link" href="/mypage"><i class="far fa-user"></i>마이페이지</a>
                        <a class="gd-nav-link" href="javascript:void(0)" @click="logout"><i class="far fa-sign-out-alt"></i>로그아웃</a>
                    </template>

                    <template v-if="isAdmin">
                        <span class="gd-nav-divider"></span>
                        <a class="gd-nav-link gd-nav-admin" v-for="m in adminMenu" :key="m.href" :href="m.href">[[ m.label ]]</a>
                    </template>
                </nav>
            </div>
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
 * 기존 address.js 와 동일한 juso.go.kr 엔드포인트·인증키를 사용한다.
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
function registerLayout(app) {
    app.component('app-header', AppHeader);
    app.component('app-footer', AppFooter);
    app.component('address-search', AddressSearch);
    return app;
}
