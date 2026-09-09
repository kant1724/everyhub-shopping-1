/**
 * 마이페이지 (Vue 3) — MDBootstrap / Bootstrap / jQuery / datepicker 라이브러리 미사용
 *
 * 기존 로직 유지:
 *  - 조회 기간 기본값: 최근 7일 (오늘 포함)
 *  - 주문내역은 주문번호 단위로 묶어서 보여준다 (기존 rowspan 그룹핑과 동일 개념)
 *  - 주문취소: 배송시작(dlvrConfirmDate) 이면 '취소불가',
 *              이미 취소면 취소일 표시, 아니면 확인 후 취소
 *  - 송장번호: 조회 후 CJ대한통운 추적 페이지 새 창
 *  - 후기작성: 별점 + 제목 + 내용
 *  - 내정보: 기존 검증 순서·문구 그대로, 비밀번호는 sha256 후 전송
 *
 * 델리미터는 [[ ]].
 */
(function () {
    const ctx = pageContext();

    function fmtDate(d) {
        const p = function (n) { return String(n).padStart(2, '0'); };
        return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
    }

    const app = Vue.createApp({
        data() {
            const today = new Date();
            const weekAgo = new Date();
            weekAgo.setDate(today.getDate() - 7);

            return {
                userNo: ctx.userNo,
                adminYn: ctx.adminYn,

                tab: 'orders',

                startDate: fmtDate(weekAgo),
                endDate: fmtDate(today),
                orders: [],
                loading: false,

                /* 모달 */
                detailOrder: null,
                invoiceOrder: null,
                invoiceRows: [],
                reviewItemNo: null,
                reviewForm: { star: 5, subject: '', content: '' },
                addressOpen: false,


                /* 내정보 */
                profile: {
                    userNm: '',
                    telno1: '', telno2: '', telno3: '',
                    password: '', passwordConfirm: '',
                    gender: '',
                    dateOfBirthY: '', dateOfBirthM: '', dateOfBirthD: '',
                    zipNo: '', addressMain: '', addressDetail: ''
                }
            };
        },

        computed: {
            isAdmin() { return this.adminYn === 'Y'; }
        },

        methods: {
            won(n) { return numberWithCommas(Number(n) || 0); },

            /**
             * 입금이 아직 확인되지 않은(취소되지 않은) 주문에만 계좌를 안내한다.
             * 계좌는 주문 시점에 ORDER_LIST_MAIN 에 저장해 둔 값이라, 판매자가
             * 나중에 계좌를 바꿔도 과거 주문에는 그때 안내한 계좌가 보인다.
             */
            needsDeposit(o) {
                return isNull(o.cancelDate) && isNull(o.depositConfirmDate) && !isNull(o.sellerAcno);
            },

            /* ---------------- 주문내역 ---------------- */
            async loadOrders() {
                this.loading = true;
                const ret = await apiPost('/admin/order_list/selectOrderListMain', {
                    startOrderDate: this.startDate,
                    endOrderDate: this.endDate,
                    userNo: this.userNo
                });
                this.loading = false;

                // 주문번호 단위로 묶는다 (한 주문에 여러 상품이 있을 수 있음)
                const map = {};
                const list = [];
                (ret || []).forEach(function (r) {
                    if (!map[r.orderNo]) {
                        map[r.orderNo] = {
                            orderNo: r.orderNo,
                            orderDate: r.orderDate,
                            totalPrice: r.totalPrice,
                            cancelDate: r.cancelDate,
                            dlvrConfirmDate: r.dlvrConfirmDate,
                            depositConfirmDate: r.depositConfirmDate,
                            receivePersonNm: r.receivePersonNm,
                            receiveTelno: r.receiveTelno,
                            receiveZipNo: r.receiveZipNo,
                            receiveAddressMain: r.receiveAddressMain,
                            receiveAddressDetail: r.receiveAddressDetail,
                            sendPersonNm: r.sendPersonNm,
                            sendTelno: r.sendTelno,
                            sendZipNo: r.sendZipNo,
                            sendAddressMain: r.sendAddressMain,
                            sendAddressDetail: r.sendAddressDetail,
                            orderRemarks: r.orderRemarks,
                            depositRemarks: r.depositRemarks,
                            sellerAcno: r.sellerAcno,
                            sellerDepositPersonNm: r.sellerDepositPersonNm,
                            items: []
                        };
                        map[r.orderNo] = map[r.orderNo];
                        list.push(map[r.orderNo]);
                    }
                    map[r.orderNo].items.push({
                        itemNo: r.itemNo,
                        itemNm: r.itemNm,
                        optionNm: r.optionNm,
                        qty: r.qty,
                        imagePath1: r.imagePath1
                    });
                });
                this.orders = list;
            },

            /** 주문 상태 뱃지 (취소 → 배송시작 → 입금확인 → 입금대기) */
            statusOf(o) {
                if (!isNull(o.cancelDate)) return { label: '주문취소', cls: 'is-cancel' };
                if (!isNull(o.dlvrConfirmDate)) return { label: '배송시작', cls: 'is-ship' };
                if (!isNull(o.depositConfirmDate)) return { label: '입금확인', cls: 'is-paid' };
                return { label: '입금대기', cls: 'is-wait' };
            },

            canCancel(o) {
                return isNull(o.cancelDate) && isNull(o.dlvrConfirmDate);
            },

            async cancelOrder(o) {
                if (!confirm('해당 주문을 취소하시겠습니까?')) return;
                await apiPost('/mypage/cancelOrder', { orderNo: o.orderNo });
                alert('주문이 취소되었습니다.');
                await this.loadOrders();
            },

            openDetail(o) { this.detailOrder = o; },

            async openInvoice(o) {
                this.invoiceOrder = o;
                const ret = await apiPost('/admin/order_list/selectInvoiceNo', { orderNo: o.orderNo });
                this.invoiceRows = ret || [];
            },

            trackInvoice(invoiceNo) {
                window.open('https://trace.cjlogistics.com/next/tracking.html?wblNo=' + invoiceNo);
            },

            openReview(itemNo) {
                this.reviewItemNo = itemNo;
                this.reviewForm = { star: 5, subject: '', content: '' };
            },

            async submitReview() {
                if (isNull(this.reviewForm.subject)) { alert('제목을 입력하세요.'); return; }
                if (isNull(this.reviewForm.content)) { alert('내용을 입력하세요.'); return; }
                await apiPost('/mypage/writeReview', {
                    subject: this.reviewForm.subject,
                    content: this.reviewForm.content,
                    star: this.reviewForm.star,
                    itemNo: this.reviewItemNo
                });
                alert('후기가 작성되었습니다.');
                this.reviewItemNo = null;
            },

            modifyOrder(o) {
                location.href = '/mypage/modify?orderNo=' + encodeURIComponent(o.orderNo) + '&gubun=mypage';
            },

            /* ---------------- 내정보 ---------------- */
            async loadProfile() {
                const ret = await apiPost('/user/selectUser', { userNo: this.userNo });
                if (!ret || ret.length === 0) return;
                const u = ret[0];
                this.profile.userNm = u.userNm || '';
                this.profile.telno1 = u.telno1 || '';
                this.profile.telno2 = u.telno2 || '';
                this.profile.telno3 = u.telno3 || '';
                this.profile.gender = u.gender === 'M' ? 'M' : 'F';
                this.profile.dateOfBirthY = u.dateOfBirthY || '';
                this.profile.dateOfBirthM = u.dateOfBirthM || '';
                this.profile.dateOfBirthD = u.dateOfBirthD || '';
                this.profile.zipNo = u.zipNo || '';
                this.profile.addressMain = u.addressMain || '';
                this.profile.addressDetail = u.addressDetail || '';
            },

            onAddressSelected(row) {
                this.profile.zipNo = row.zipNo;
                this.profile.addressMain = row.addr;
                this.addressOpen = false;
            },

            /** 기존 검증 순서·문구를 그대로 유지 */
            validateProfile() {
                const p = this.profile;
                if (isNull(p.telno1) || isNull(p.telno2) || isNull(p.telno3)) {
                    alert('휴대폰 번호를 정확히 입력하세요.'); return false;
                }
                if (isNull(p.password)) { alert('패스워드를 입력하세요.'); return false; }
                if (p.password !== p.passwordConfirm) { alert('비밀번호 확인을 정확히 입력하세요.'); return false; }
                if (isNull(p.userNm)) { alert('이름을 입력하세요.'); return false; }
                if (isNull(p.gender)) { alert('성별을 체크하세요.'); return false; }
                if (isNull(p.addressMain)) { alert('주소를 입력하세요.'); return false; }
                if (isNull(p.addressDetail)) { alert('상세주소를 입력하세요.'); return false; }
                if (isNull(p.zipNo)) { alert('주소를 입력하세요.'); return false; }
                return true;
            },

            async updateProfile() {
                if (!this.validateProfile()) return;
                const p = this.profile;
                await apiPost('/mypage/updateUser', {
                    userNm: p.userNm,
                    password: sha256(p.password),
                    telno: p.telno1 + p.telno2 + p.telno3,
                    telno1: p.telno1,
                    telno2: p.telno2,
                    telno3: p.telno3,
                    gender: p.gender,
                    dateOfBirth: String(p.dateOfBirthY) + String(p.dateOfBirthM) + String(p.dateOfBirthD),
                    dateOfBirthY: p.dateOfBirthY,
                    dateOfBirthM: p.dateOfBirthM,
                    dateOfBirthD: p.dateOfBirthD,
                    zipNo: p.zipNo,
                    addressMain: p.addressMain,
                    addressDetail: p.addressDetail
                });
                alert('내정보가 변경되었습니다.');
                p.password = '';
                p.passwordConfirm = '';
            }
        },

        async mounted() {
            await this.loadOrders();
            await this.loadProfile();
        }
    });

    registerLayout(app);
    app.config.compilerOptions.delimiters = ['[[', ']]'];
    app.mount('#mypage_app');
})();
