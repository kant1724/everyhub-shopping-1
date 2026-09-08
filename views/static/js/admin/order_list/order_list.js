/**
 * 주문 관리 (Vue 3) — MDBootstrap / Bootstrap / jQuery / moment / datepicker 미사용
 *
 * 서버 계약은 전부 그대로 유지한다:
 *   POST /admin/order_list/selectOrderListMain      {startOrderDate,endOrderDate,orderUserNm,userNm,depositPersonNm,userNo:''}
 *   POST /admin/order_list/updateDepositConfirmDate {orderNo}
 *   POST /admin/order_list/updateDlvrConfirmDate    {data: JSON.stringify({orderListDetail:[{orderNo,orderSeq,itemNm,optionNm,orderTelno}]})}
 *   POST /admin/order_list/selectInvoiceNo          {orderNo}
 *   POST /admin/order_list/insertInvoiceNo          {orderNo,invoiceNo}
 *   POST /admin/order_list/deleteInvoiceNo          {orderNo,invoiceNo}
 *   POST /admin/order_list/updateAdditionalInfo     {orderNo,basicFares,boxType,fareType}
 *   POST /admin/order_list/sendSMS                  {smsSubject,smsContent,smsTelno}
 *   POST /mypage/cancelOrder                        {orderNo}
 *   정보수정  → /mypage/modify?orderNo=..&gubun=order_list
 *   송장조회  → https://trace.cjlogistics.com/next/tracking.html?wblNo=..
 *
 * 엑셀 3종(주문내역 / CJ / 한진)의 컬럼 순서·헤더 문자열·기본값(보내는분이 비면 판매자 정보로 대체)은
 * 택배사 양식이라 한 글자도 바꾸지 않았다. XLSX 는 기존과 같이 로컬 lib 를 쓴다.
 *
 * 화면만 주문번호 단위로 묶어 카드로 보여준다. 체크박스는 기존과 같이 주문상세(줄) 단위다.
 */
(function () {
    const ctx = pageContext();

    /** YYYY-MM-DD (moment 대체) */
    function ymd(d) {
        const p = function (n) { return (n < 10 ? '0' : '') + n; };
        return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
    }

    const TODAY = ymd(new Date());

    const app = Vue.createApp({
        data() {
            return {
                userNo: ctx.userNo,
                adminYn: ctx.adminYn,

                filter: {
                    startOrderDate: TODAY,
                    endOrderDate: TODAY,
                    orderUserNm: '',
                    userNm: '',
                    depositPersonNm: ''
                },

                rows: [],          // 서버가 준 원본 (엑셀은 이걸 쓴다)
                seller: {},        // 보내는분이 비었을 때 채울 판매자 정보
                loading: true,
                selected: {},      // "orderNo_orderSeq" -> true

                detailModal: null,     // 상세정보
                invoiceModal: null,    // 송장번호
                invoiceRows: [],
                invoiceNoInput: '',
                extraModal: null,      // 기타정보 (기본운임/박스타입/운임구분)
                extraForm: { basicFares: '', boxType: '', fareType: '' },
                smsModal: null,        // 문자 발송
                smsForm: { smsSubject: '', smsContent: '', smsTelno: '' },
                busy: false
            };
        },

        computed: {
            /** 주문번호 단위로 묶는다 (원본의 rowspan 을 카드로 대체) */
            orders() {
                const map = {};
                const order = [];
                this.rows.forEach(function (r) {
                    if (!map[r.orderNo]) {
                        map[r.orderNo] = { head: r, lines: [] };
                        order.push(r.orderNo);
                    }
                    map[r.orderNo].lines.push(r);
                });
                return order.map(function (no) { return map[no]; });
            },

            totalCnt() { return this.orders.length; },

            selectedCount() {
                const s = this.selected;
                return Object.keys(s).filter(function (k) { return s[k]; }).length;
            },

            allChecked() {
                const sel = this.selectableKeys;
                if (sel.length === 0) return false;
                const s = this.selected;
                return sel.every(function (k) { return s[k]; });
            },

            selectableKeys() {
                const self = this;
                const keys = [];
                this.rows.forEach(function (r) {
                    if (self.isSelectable(r)) keys.push(self.keyOf(r));
                });
                return keys;
            }
        },

        methods: {
            won(n) { return numberWithCommas(Number(n) || 0); },

            /**
             * 템플릿에서 쓰는 빈 값 판정.
             * 전역 isNull 은 Vue 표현식 스코프에서 보이지 않으므로 메서드로 감싼다.
             */
            blank(v) { return isNull(v); },

            keyOf(r) { return r.orderNo + '_' + r.orderSeq; },

            /** 배송이 이미 시작된 줄은 원본과 동일하게 선택 불가 */
            isSelectable(r) { return isNull(r.dlvrConfirmDate); },

            isChecked(r) { return !!this.selected[this.keyOf(r)]; },

            toggle(r) {
                const k = this.keyOf(r);
                this.selected[k] = !this.selected[k];
            },

            toggleAll(e) {
                const on = e.target.checked;
                const self = this;
                this.selectableKeys.forEach(function (k) { self.selected[k] = on; });
            },

            isToday(d) { return d === TODAY; },

            isCancelled(o) { return !isNull(o.head.cancelDate); },

            /** 취소 가능: 아직 취소되지 않았고 배송도 시작되지 않은 주문 (원본 조건 그대로) */
            canCancel(o) {
                return isNull(o.head.cancelDate) && isNull(o.head.dlvrConfirmDate);
            },

            hasRemarks(o) {
                return !isNull(o.head.orderRemarks) || !isNull(o.head.depositRemarks);
            },

            /* ---------------- 조회 ---------------- */
            async search() {
                this.loading = true;
                this.selected = {};
                const f = this.filter;
                this.rows = (await apiPost('/admin/order_list/selectOrderListMain', {
                    startOrderDate: f.startOrderDate,
                    endOrderDate: f.endOrderDate,
                    orderUserNm: f.orderUserNm,
                    userNm: f.userNm,
                    depositPersonNm: f.depositPersonNm,
                    userNo: ''
                })) || [];
                this.loading = false;
            },

            /* ---------------- 입금확인 / 배송시작 / 주문취소 ---------------- */
            async confirmDeposit(o) {
                if (this.busy) return;
                this.busy = true;
                await apiPost('/admin/order_list/updateDepositConfirmDate', { orderNo: o.head.orderNo });
                this.busy = false;
                alert('입금확인 처리되었습니다.');
                await this.search();
            },

            async startDelivery() {
                const self = this;
                const orderListDetail = [];
                this.rows.forEach(function (r) {
                    if (!self.isSelectable(r) || !self.isChecked(r)) return;
                    orderListDetail.push({
                        orderNo: r.orderNo,
                        orderSeq: r.orderSeq,
                        itemNm: r.itemNm,
                        optionNm: r.optionNm,
                        orderTelno: r.orderTelno
                    });
                });
                if (orderListDetail.length === 0) {
                    alert('배송시작할 주문을 선택하세요.');
                    return;
                }
                if (!confirm('선택된 주문내역의 배송을 시작하시겠습니까?')) return;
                if (this.busy) return;
                this.busy = true;
                await apiPost('/admin/order_list/updateDlvrConfirmDate', {
                    data: JSON.stringify({ orderListDetail: orderListDetail })
                });
                this.busy = false;
                alert('배송시작 처리되었습니다.');
                await this.search();
            },

            async cancelOrder(o) {
                if (!confirm('해당 주문을 취소하시겠습니까?')) return;
                if (this.busy) return;
                this.busy = true;
                await apiPost('/mypage/cancelOrder', { orderNo: o.head.orderNo });
                this.busy = false;
                alert('주문이 취소되었습니다.');
                await this.search();
            },

            modifyOrder(o) {
                location.href = '/mypage/modify?orderNo=' + o.head.orderNo + '&gubun=order_list';
            },

            /* ---------------- 상세정보 ---------------- */
            openDetail(o) { this.detailModal = o.head; },

            /* ---------------- 송장번호 ---------------- */
            async openInvoice(o) {
                this.invoiceModal = o.head;
                this.invoiceNoInput = '';
                await this.loadInvoice();
            },

            async loadInvoice() {
                this.invoiceRows = (await apiPost('/admin/order_list/selectInvoiceNo',
                    { orderNo: this.invoiceModal.orderNo })) || [];
            },

            async saveInvoice() {
                if (isNull(this.invoiceNoInput)) { alert('송장번호를 입력하세요.'); return; }
                if (this.busy) return;
                this.busy = true;
                await apiPost('/admin/order_list/insertInvoiceNo', {
                    orderNo: this.invoiceModal.orderNo,
                    invoiceNo: this.invoiceNoInput
                });
                this.busy = false;
                alert('송장번호가 저장되었습니다.');
                this.invoiceNoInput = '';
                await this.loadInvoice();
            },

            async deleteInvoice(inv) {
                if (!confirm('해당 송장번호를 삭제하시겠습니까?')) return;
                if (this.busy) return;
                this.busy = true;
                await apiPost('/admin/order_list/deleteInvoiceNo', {
                    orderNo: this.invoiceModal.orderNo,
                    invoiceNo: inv.invoiceNo
                });
                this.busy = false;
                alert('송장번호가 삭제되었습니다.');
                await this.loadInvoice();
            },

            traceInvoice(inv) {
                window.open('https://trace.cjlogistics.com/next/tracking.html?wblNo=' + inv.invoiceNo);
            },

            /* ---------------- 기타정보 ---------------- */
            openExtra(o) {
                this.extraModal = o.head;
                this.extraForm = {
                    basicFares: o.head.basicFares == null ? '' : String(o.head.basicFares),
                    boxType: o.head.boxType == null ? '' : String(o.head.boxType),
                    fareType: o.head.fareType == null ? '' : String(o.head.fareType)
                };
            },

            async saveExtra() {
                if (this.busy) return;
                this.busy = true;
                await apiPost('/admin/order_list/updateAdditionalInfo', {
                    orderNo: this.extraModal.orderNo,
                    basicFares: this.extraForm.basicFares,
                    boxType: this.extraForm.boxType,
                    fareType: this.extraForm.fareType
                });
                this.busy = false;
                alert('기타정보가 저장되었습니다.');
                this.extraModal = null;
                await this.search();
            },

            /* ---------------- 문자 발송 ---------------- */
            openSms(o) {
                this.smsModal = o.head;
                this.smsForm = { smsSubject: '', smsContent: '', smsTelno: o.head.orderTelno || '' };
            },

            async sendSms() {
                if (!confirm('문자메세지를 전송하시겠습니까?')) return;
                if (this.busy) return;
                this.busy = true;
                await apiPost('/admin/order_list/sendSMS', {
                    smsSubject: this.smsForm.smsSubject,
                    smsContent: this.smsForm.smsContent,
                    smsTelno: this.smsForm.smsTelno
                });
                this.busy = false;
                alert('메세지가 전송되었습니다.');
                this.smsModal = null;
            },

            /* ================= 엑셀 ================= */

            /** 선택되고 취소되지 않은 주문상세 줄만 모은다 */
            pickedRows() {
                const self = this;
                return this.rows.filter(function (r) {
                    if (!isNull(r.cancelDate)) return false;
                    return self.isChecked(r);
                });
            },

            write(wb, data, header, fileName) {
                const ws = XLSX.utils.json_to_sheet(data, header);
                XLSX.utils.book_append_sheet(wb, ws, '주문내역');
                XLSX.writeFile(wb, fileName);
            },

            /** 화면에 보이는 주문내역 전체 (원본과 동일하게 선택 여부와 무관) */
            exportOrderList() {
                const self = this;
                const header = {
                    header: ['주문번호', '주문일', '주문자명', '받는자명', '주문자연락처', '받는자연락처',
                             '상품/옵션', '수량', '총금액', '입금자명', '배송일자', '취소일자']
                };
                const data = this.rows.map(function (r) {
                    return {
                        '주문번호': r.orderNo,
                        '주문일': r.orderDate,
                        '주문자명': r.orderPersonNm,
                        '받는자명': r.receivePersonNm,
                        '주문자연락처': r.orderTelno,
                        '받는자연락처': r.receiveTelno,
                        '상품/옵션': r.itemNm + ' ' + (r.optionNm || ''),
                        '수량': r.qty,
                        '총금액': self.won(r.totalPrice),
                        '입금자명': r.depositPersonNm,
                        '배송일자': isNull(r.dlvrConfirmDate) ? '' : r.dlvrConfirmDate,
                        '취소일자': isNull(r.cancelDate) ? '' : r.cancelDate
                    };
                });
                if (data.length === 0) { alert('내려받을 주문내역이 없습니다.'); return; }
                this.write(XLSX.utils.book_new(), data, header, 'order_list.xlsx');
            },

            /** CJ 대한통운 양식 — 헤더/순서/기본값 원본 그대로 */
            exportCj() {
                const s = this.seller || {};
                const header = {
                    header: ['보내는성명', '보내는분전화번호', '보내는분기타연락처', '보내는분주소(전체, 분할)',
                             '받는분성명', '받는분전화번호', '받는분기타연락처', '받는분주소(전체, 분할)',
                             '기본운임', '박스타입', '운임구분', '품목명', '박스수량', '배송메세지1']
                };
                const data = this.pickedRows().map(function (r) {
                    const d = {};
                    d['보내는성명'] = r.sendPersonNm;
                    d['보내는분전화번호'] = r.sendTelno;
                    d['보내는분기타연락처'] = r.sendTelno;
                    d['보내는분주소(전체, 분할)'] = r.sendAddressMain + ' ' + r.sendAddressDetail;
                    if (d['보내는성명'] == '') d['보내는성명'] = s.sellerNm;
                    if (d['보내는분전화번호'] == '') d['보내는분전화번호'] = s.telno;
                    if (d['보내는분기타연락처'] == '') d['보내는분기타연락처'] = s.telno;
                    if (d['보내는분주소(전체, 분할)'] == ' ') d['보내는분주소(전체, 분할)'] = s.sendAddress;
                    d['받는분성명'] = r.receivePersonNm;
                    d['받는분전화번호'] = r.receiveTelno;
                    d['받는분기타연락처'] = r.receiveTelno;
                    d['받는분주소(전체, 분할)'] = r.receiveAddressMain + ' ' + r.receiveAddressDetail;
                    d['기본운임'] = r.basicFares;
                    d['박스타입'] = r.boxType;
                    d['운임구분'] = r.fareType;
                    d['품목명'] = r.itemNm + ',' + r.optionNm;
                    d['박스수량'] = r.qty;
                    d['배송메세지1'] = r.orderRemarks;
                    return d;
                });
                if (data.length === 0) { alert('체크박스로 엑셀다운할 리스트를 선택해 주세요.'); return; }
                this.write(XLSX.utils.book_new(), data, header, 'order_list.xlsx');
            },

            /** 한진택배 양식 — 헤더/순서/기본값 원본 그대로 */
            exportHanjin() {
                const s = this.seller || {};
                const header = {
                    header: ['보내는분', '보내는분 연락처', '보내는 담당자', '보내는분전화번호',
                             '보내는분우편번호', '보내는분주소', '받는분성함', '받는분 연락처',
                             '받는분 담당자', '받는분 핸드폰', '받는분 우편번호', '받는분주소',
                             '수량', '품목명', '운임type', '지불조건', '출고번호', '특기사항']
                };
                const data = this.pickedRows().map(function (r) {
                    const d = {};
                    d['보내는분'] = r.sendPersonNm;
                    d['보내는분 연락처'] = r.sendTelno;
                    d['보내는분전화번호'] = r.sendTelno;
                    d['보내는분우편번호'] = r.sendZipNo;
                    d['보내는분주소'] = r.sendAddressMain + ' ' + r.sendAddressDetail;
                    if (d['보내는분'] == '') d['보내는분'] = s.sellerNm;
                    if (d['보내는분 연락처'] == '') d['보내는분 연락처'] = s.telno;
                    if (d['보내는분전화번호'] == '') d['보내는분전화번호'] = s.telno;
                    if (d['보내는분우편번호'] == '') d['보내는분우편번호'] = s.sendZipNo;
                    if (d['보내는분주소'] == ' ') d['보내는분주소'] = s.sendAddress;
                    d['받는분성함'] = r.receivePersonNm;
                    d['받는분 연락처'] = r.receiveTelno;
                    d['받는분 핸드폰'] = r.receiveTelno;
                    d['받는분 우편번호'] = r.receiveZipNo;
                    d['받는분주소'] = r.receiveAddressMain + ' ' + r.receiveAddressDetail;
                    d['수량'] = r.qty;
                    d['품목명'] = r.itemNm + ',' + r.optionNm;
                    d['운임type'] = 'B';
                    d['지불조건'] = '선불';
                    d['특기사항'] = r.orderRemarks;
                    return d;
                });
                if (data.length === 0) { alert('체크박스로 엑셀다운할 리스트를 선택해 주세요.'); return; }
                this.write(XLSX.utils.book_new(), data, header, 'order_list.xlsx');
            }
        },

        async mounted() {
            const s = await apiPost('/user/selectSellerInfo', { sellerNo: 1 });
            if (s && s.length > 0) this.seller = s[0];
            await this.search();
        }
    });

    registerLayout(app);
    app.config.compilerOptions.delimiters = ['[[', ']]'];
    app.mount('#order_list_app');
})();
