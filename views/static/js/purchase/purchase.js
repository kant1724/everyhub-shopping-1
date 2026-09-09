/**
 * 주문결제 (Vue 3) — MDBootstrap / Bootstrap / jQuery / jsGrid 미사용
 *
 * ★ 돈이 걸린 화면이라 기존 비즈니스 규칙을 하나도 바꾸지 않았다.
 *
 *  1) 진입 경로 2가지
 *     - 장바구니: ?items=1;2;3  → localStorage 'product' 에서 id 로 매칭
 *     - 바로주문: ?itemNo=&optionNo=&qty=... (상품상세에서 전달)
 *     - 로그인/재주문 복귀 시 direct* · order* · send* 파라미터로 폼 복원
 *  2) 추가배송비: 받는분 주소 선택 시 우편번호로 조회.
 *     includingKeyword 가 있으면 주소에 그 단어가 포함될 때만 적용.
 *     금액 = shippingFee × 총수량. 최종 결제금액에 합산해서 전송.
 *  3) 보내는분 미입력 시 농원 기본값(현병윤 / 01094278169 / 제주 간월동로 54)
 *  4) 검증 항목·문구, 주문 확인 confirm, 응답 'not ok' · 'diff item' 처리 동일
 *     ('sold out' 은 품절 / 출하전 상품이 섞여 있을 때 서버가 돌려주는 값)
 *  5) 성공 시 purchase_complete 로 동일한 쿼리스트링 전달 (재주문 기능이 이를 사용)
 *
 * 델리미터는 [[ ]] (서버 mustache 가 {{ }} 를 쓰므로).
 */
(function () {
    /* 농원 기본 발송인 정보 — 기존 코드의 하드코딩 값을 그대로 사용 */
    const DEFAULT_SENDER = {
        personNm: '현병윤',
        telno: '01094278169',
        telno1: '010',
        telno2: '9427',
        telno3: '8169',
        zipNo: '63246',
        addressMain: '제주특별자치도 제주시 간월동로 54',
        addressDetail: '제주품은 간드락'
    };
    const SELLER_NO = 1;

    const ctx = pageContext();
    const params = new URLSearchParams(location.search);
    const q = function (k) { return params.get(k) || ''; };

    const app = Vue.createApp({
        data() {
            return {
                userNo: ctx.userNo,
                adminYn: ctx.adminYn,

                /* 주문 상품 */
                orderListDetail: [],
                orderRows: [],          // 화면 표시용
                totalPrice: 0,
                totalQty: 0,
                additionalShippingFee: 0,
                additionalShippingText: '',

                /* 품절 · 출하전 등으로 주문할 수 없는 상품 [{itemNm, reason}] */
                unavailable: [],

                /* 판매자(입금 계좌) */
                sellerAcno: '',
                sellerDepositPersonNm: '',

                /* 폼 */
                form: {
                    orderPersonNm: q('orderPersonNm'),
                    orderTelno1: q('orderTelno1'),
                    orderTelno2: q('orderTelno2'),
                    orderTelno3: q('orderTelno3'),
                    orderRemarks: q('orderRemarks'),
                    orderZipNo: '',
                    orderAddressMain: '',
                    orderAddressDetail: '',

                    senderSame: false,
                    sendPersonNm: q('sendPersonNm'),
                    sendTelno1: q('sendTelno1'),
                    sendTelno2: q('sendTelno2'),
                    sendTelno3: q('sendTelno3'),

                    receiverSame: false,
                    receivePersonNm: '',
                    receiveTelno1: '',
                    receiveTelno2: '',
                    receiveTelno3: '',
                    receiveZipNo: '',
                    receiveAddressMain: '',
                    receiveAddressDetail: '',

                    depositWho: '',
                    depositPersonNm: '',
                    depositRemarks: ''
                },

                submitting: false,

                /* 주소 검색 모달 */
                addressModalOpen: false,
                addressKeyword: '',
                addressRows: [],
                addressPage: 1,
                addressTotal: 0,
                addressGubun: 1,

                /* 최근 받는분 모달 */
                receiverModalOpen: false,
                receiverTelno: '',
                receiverRows: [],

                /* 과거 입금자명 모달 */
                depositModalOpen: false,
                depositRows: []
            };
        },

        computed: {
            /** 하나라도 주문할 수 없는 상품이 있으면 결제 자체를 막는다 */
            hasUnavailable() { return this.unavailable.length > 0; },
            unavailableText() {
                return this.unavailable.map(function (u) {
                    return u.itemNm + '(' + u.reason + ')';
                }).join(', ');
            },
            finalPrice() { return this.totalPrice + this.additionalShippingFee; },
            finalPriceText() { return numberWithCommas(this.finalPrice) + '원'; },
            totalPriceText() { return numberWithCommas(this.totalPrice) + '원'; },
            addressPageCount() {
                return Math.max(1, Math.ceil(Number(this.addressTotal) / 10));
            }
        },

        methods: {
            won(n) { return numberWithCommas(Number(n) || 0) + '원'; },

            /* ---------------- 주문 상품 구성 ---------------- */
            buildFromCart(itemsParam) {
                let productArr = [];
                try {
                    const raw = JSON.parse(localStorage.getItem('product'));
                    if (Array.isArray(raw)) productArr = raw;
                } catch (e) { productArr = []; }

                const ids = itemsParam.split(';');
                let sum = 0;
                let qtySum = 0;

                ids.forEach((id) => {
                    productArr.forEach((p) => {
                        if (String(p.id) !== String(id)) return;
                        this.orderListDetail.push({
                            qty: p.qty,
                            itemNo: p.itemNo,
                            itemNm: p.itemNm,
                            keepingMethod: p.keepingMethod,
                            damageRemarks: p.damageRemarks,
                            optionNo: p.optionNo,
                            optionNm: p.optionNm,
                            itemPriceNum: p.itemPriceNum
                        });
                        this.orderRows.push({
                            imagePath: p.imagePath,
                            itemNm: p.itemNm,
                            optionNm: p.optionNm,
                            itemPrice: p.itemPrice,
                            shippingFee: p.shippingFee,
                            qty: p.qty,
                            sum: (Number(p.itemPriceNum) + Number(p.shippingFeeNum)) * Number(p.qty)
                        });
                        sum += (Number(p.itemPriceNum) + Number(p.shippingFeeNum)) * Number(p.qty);
                        qtySum += Number(p.qty);
                    });
                });

                this.totalPrice = sum;
                this.totalQty = qtySum;
            },

            async buildDirect() {
                const itemNo = q('itemNo') || q('directItemNo');
                const optionNo = q('optionNo') || q('directOptionNo');
                const optionNm = q('optionNm') || q('directOptionNm');
                const itemNm = q('itemNm') || q('directItemNm');
                const imagePath = q('imagePath') || q('directImagePath');
                const itemPrice = q('itemPrice') || q('directItemPrice');
                const shippingFee = q('shippingFee') || q('directShippingFee');
                const itemPriceNum = q('itemPriceNum') || q('directItemPriceNum');
                const shippingFeeNum = q('shippingFeeNum') || q('directShippingFeeNum');
                const qty = q('qty') || q('directQty');

                // 보관방법 / 파손시 조치는 상품 정보에서 가져온다 (SMS 문구에 사용)
                let keepingMethod = q('keepingMethod') || q('directKeepingMethod');
                let damageRemarks = '';
                const ret = await apiPost('/admin/item_manager/selectOneItem', { itemNo: itemNo });
                if (ret && ret.length > 0) {
                    keepingMethod = ret[0].keepingMethod;
                    damageRemarks = ret[0].damageRemarks;
                }

                this.orderListDetail.push({
                    qty: qty,
                    itemNo: itemNo,
                    itemNm: itemNm,
                    keepingMethod: keepingMethod,
                    damageRemarks: damageRemarks,
                    optionNo: optionNo,
                    optionNm: optionNm,
                    itemPriceNum: itemPriceNum
                });

                const sum = (Number(itemPriceNum) + Number(shippingFeeNum)) * Number(qty);
                this.orderRows.push({
                    imagePath: imagePath,
                    itemNm: itemNm,
                    optionNm: optionNm,
                    itemPrice: itemPrice,
                    shippingFee: shippingFee,
                    qty: qty,
                    sum: sum
                });
                this.totalPrice = sum;
                this.totalQty = Number(qty);
            },

            /* ---------------- 판매 상태 확인 ---------------- */
            /**
             * 주문서에 올라온 상품이 지금도 살 수 있는 상태인지 확인한다.
             * 장바구니에 오래 담겨 있었거나, 상품 페이지를 열어 둔 사이에
             * 품절 / 출하전으로 바뀌었을 수 있다.
             * (서버도 주문 시점에 같은 검사를 하므로 여기는 안내가 목적이다)
             *
             * 관리자는 상품 상세와 서버 검증 모두에서 예외라 여기서도 막지 않는다.
             */
            async checkItemStatus() {
                if (this.adminYn === 'Y') { this.unavailable = []; return; }

                // useYn 으로 거르지 않는다 — 장바구니와 같은 이유로, 실제 사유를
                // 그대로 알려주려면 삭제되지 않은 상품 전체가 필요하다
                const list = (await apiPost('/admin/item_manager/selectItemList', {}));
                if (list === null) return;   // 조회 실패 시엔 막지 않고 서버 검증에 맡긴다

                const map = {};
                (list || []).forEach(function (i) { map[String(i.itemNo)] = i; });

                const bad = [];
                this.orderListDetail.forEach(function (d) {
                    const cur = map[String(d.itemNo)];
                    let reason = '';
                    if (!cur) reason = '판매중지';
                    else if (cur.soldOutYn === 'Y') reason = '품절';
                    else if (cur.shipYn !== 'Y') reason = '출하전';
                    else if (cur.useYn !== 'Y') reason = '판매중지';
                    if (reason !== '') bad.push({ itemNm: d.itemNm, reason: reason });
                });
                this.unavailable = bad;
            },

            /* ---------------- 주문자 정보 ---------------- */
            async loadUser() {
                const ret = await apiPost('/user/selectUser', { userNo: this.userNo });
                if (!ret || ret.length === 0) return;
                const u = ret[0];
                // 로그인 복귀 시 쿼리로 넘어온 값이 있으면 그것을 우선한다
                if (isNull(this.form.orderPersonNm)) this.form.orderPersonNm = u.userNm || '';
                if (isNull(this.form.orderTelno1)) {
                    this.form.orderTelno1 = u.telno1 || '';
                    this.form.orderTelno2 = u.telno2 || '';
                    this.form.orderTelno3 = u.telno3 || '';
                }
                this.form.orderZipNo = u.zipNo || '';
                this.form.orderAddressMain = u.addressMain || '';
                this.form.orderAddressDetail = u.addressDetail || '';
            },

            async loadSeller() {
                const ret = await apiPost('/user/selectSellerInfo', { sellerNo: SELLER_NO });
                if (!ret || ret.length === 0) return;
                this.sellerAcno = ret[0].acno || '';
                this.sellerDepositPersonNm = ret[0].depositPersonNm || '';
            },

            /* ---------------- 동일정보 복사 ---------------- */
            orderInfoFilled() {
                return !isNull(this.form.orderPersonNm) &&
                       !isNull(this.form.orderTelno1) &&
                       !isNull(this.form.orderTelno2) &&
                       !isNull(this.form.orderTelno3);
            },

            onSenderSame(e) {
                if (!e.target.checked) { this.form.senderSame = false; return; }
                if (!this.orderInfoFilled()) {
                    alert('주문자 정보를 입력하세요.');
                    this.form.senderSame = false;
                    return;
                }
                this.form.senderSame = true;
                this.form.sendPersonNm = this.form.orderPersonNm;
                this.form.sendTelno1 = this.form.orderTelno1;
                this.form.sendTelno2 = this.form.orderTelno2;
                this.form.sendTelno3 = this.form.orderTelno3;
            },

            onReceiverSame(e) {
                if (!e.target.checked) { this.form.receiverSame = false; return; }
                if (!this.orderInfoFilled()) {
                    alert('주문자 정보를 입력하세요.');
                    this.form.receiverSame = false;
                    return;
                }
                this.form.receiverSame = true;
                this.form.receivePersonNm = this.form.orderPersonNm;
                this.form.receiveTelno1 = this.form.orderTelno1;
                this.form.receiveTelno2 = this.form.orderTelno2;
                this.form.receiveTelno3 = this.form.orderTelno3;
                this.form.receiveZipNo = this.form.orderZipNo;
                this.form.receiveAddressMain = this.form.orderAddressMain;
                this.form.receiveAddressDetail = this.form.orderAddressDetail;
                if (!isNull(this.form.receiveZipNo)) this.checkAdditionalShippingFee(this.form.receiveZipNo);
            },

            /** 주문자 정보가 바뀌면 동일 체크된 항목도 따라간다 (기존 동작) */
            onOrderInfoChanged() {
                if (this.form.senderSame) {
                    this.form.sendPersonNm = this.form.orderPersonNm;
                    this.form.sendTelno1 = this.form.orderTelno1;
                    this.form.sendTelno2 = this.form.orderTelno2;
                    this.form.sendTelno3 = this.form.orderTelno3;
                }
                if (this.form.receiverSame) {
                    this.form.receivePersonNm = this.form.orderPersonNm;
                    this.form.receiveTelno1 = this.form.orderTelno1;
                    this.form.receiveTelno2 = this.form.orderTelno2;
                    this.form.receiveTelno3 = this.form.orderTelno3;
                }
            },

            pickDepositWho(who) {
                this.form.depositWho = who;
                if (who === 'order') this.form.depositPersonNm = this.form.orderPersonNm;
                else if (who === 'send') this.form.depositPersonNm = this.form.sendPersonNm;
                else if (who === 'receive') this.form.depositPersonNm = this.form.receivePersonNm;
            },

            /** 전화번호 입력 시 자동으로 다음 칸으로 이동 (기존 UX) */
            advance(e, len, nextRef) {
                if (String(e.target.value).length >= len && this.$refs[nextRef]) {
                    this.$refs[nextRef].focus();
                }
            },

            /* ---------------- 추가 배송비 ---------------- */
            async checkAdditionalShippingFee(zipNo) {
                this.additionalShippingFee = 0;
                this.additionalShippingText = '';
                const ret = await apiPost('/admin/delivery_manager/selectShippingInfoByZipNo', { zipNo: zipNo });
                if (!ret || ret.length === 0) return;
                // 포함 키워드가 지정되어 있으면 주소에 그 단어가 있을 때만 적용한다
                if (ret[0].includingKeyword !== '' && ret[0].includingKeyword != null) {
                    if (String(this.form.receiveAddressMain).indexOf(ret[0].includingKeyword) === -1) return;
                }
                this.additionalShippingFee = Number(ret[0].shippingFee) * this.totalQty;
                this.additionalShippingText =
                    '해당지역은 추가배송료가 있습니다. +' + numberWithCommas(this.additionalShippingFee) + '원';
            },

            /* ---------------- 주소 검색 (공용 컴포넌트 사용) ---------------- */
            openAddressModal() {
                this.addressModalOpen = true;
            },

            selectAddress(row) {
                this.form.receiveZipNo = row.zipNo;
                this.form.receiveAddressMain = row.addr;
                this.addressModalOpen = false;
                // 받는분 주소가 정해지면 추가배송비를 다시 계산한다 (기존 동작)
                this.checkAdditionalShippingFee(row.zipNo);
            },

            /* ---------------- 최근 받는분 ---------------- */
            async searchRecentReceiver() {
                const ret = await apiPost('/admin/order_list/selectRecentReceiver', { telno: this.receiverTelno });
                this.receiverRows = ret || [];
            },

            pickReceiver(r) {
                this.form.receivePersonNm = r.receivePersonNm;
                this.form.receiveTelno1 = r.receiveTelno1;
                this.form.receiveTelno2 = r.receiveTelno2;
                this.form.receiveTelno3 = r.receiveTelno3;
                this.form.receiveZipNo = r.receiveZipNo;
                this.form.receiveAddressMain = r.receiveAddressMain;
                this.form.receiveAddressDetail = r.receiveAddressDetail;
                this.receiverModalOpen = false;
                if (!isNull(r.receiveZipNo)) this.checkAdditionalShippingFee(r.receiveZipNo);
            },

            /* ---------------- 과거 입금자명 ---------------- */
            async searchDepositPersons() {
                const ret = await apiPost('/admin/order_list/selectDepositPersonList', {});
                this.depositRows = ret || [];
            },

            pickDepositPerson(d) {
                this.form.depositPersonNm = d.depositPersonNm;
                this.depositModalOpen = false;
            },

            /* ---------------- 검증 · 주문 ---------------- */
            validate() {
                const f = this.form;
                if (isNull(f.orderPersonNm)) { alert('주문자명을 입력하세요.'); return false; }
                if (isNull(f.orderTelno1) || isNull(f.orderTelno2) || isNull(f.orderTelno3)) {
                    alert('주문자 휴대폰 번호를 입력하세요.'); return false;
                }
                if (isNull(f.receivePersonNm)) { alert('받는자명을 입력하세요'); return false; }
                if (isNull(f.receiveTelno1) || isNull(f.receiveTelno2) || isNull(f.receiveTelno3)) {
                    alert('받는자 휴대폰 번호를 입력하세요.'); return false;
                }
                if (isNull(f.receiveAddressMain)) { alert('받는자 주소를 입력하세요'); return false; }
                if (isNull(f.receiveAddressDetail)) { alert('받는자 상세주소를 입력하세요'); return false; }
                if (isNull(f.depositPersonNm)) { alert('입금자명을 입력하세요'); return false; }
                return true;
            },

            buildOrderListMain() {
                const f = this.form;
                const main = {};

                // SMS 문구에 쓰이는 계좌 안내 (기존 포맷 유지)
                main.acno = '\n' + this.sellerAcno + '\n' + this.sellerDepositPersonNm;

                main.orderPersonNm = f.orderPersonNm;
                main.orderTelno = f.orderTelno1 + f.orderTelno2 + f.orderTelno3;
                main.orderTelno1 = f.orderTelno1;
                main.orderTelno2 = f.orderTelno2;
                main.orderTelno3 = f.orderTelno3;

                // 보내는분 미입력 시 농원 기본값
                main.sendPersonNm = isNull(f.sendPersonNm) ? DEFAULT_SENDER.personNm : f.sendPersonNm;
                if (isNull(f.sendTelno1)) {
                    main.sendTelno = DEFAULT_SENDER.telno;
                    main.sendTelno1 = DEFAULT_SENDER.telno1;
                    main.sendTelno2 = DEFAULT_SENDER.telno2;
                    main.sendTelno3 = DEFAULT_SENDER.telno3;
                } else {
                    main.sendTelno = f.sendTelno1 + f.sendTelno2 + f.sendTelno3;
                    main.sendTelno1 = f.sendTelno1;
                    main.sendTelno2 = f.sendTelno2;
                    main.sendTelno3 = f.sendTelno3;
                }
                main.sendZipNo = DEFAULT_SENDER.zipNo;
                main.sendAddressMain = DEFAULT_SENDER.addressMain;
                main.sendAddressDetail = DEFAULT_SENDER.addressDetail;

                main.receivePersonNm = f.receivePersonNm;
                main.receiveTelno = f.receiveTelno1 + f.receiveTelno2 + f.receiveTelno3;
                main.receiveTelno1 = f.receiveTelno1;
                main.receiveTelno2 = f.receiveTelno2;
                main.receiveTelno3 = f.receiveTelno3;
                main.receiveZipNo = f.receiveZipNo;
                main.receiveAddressMain = f.receiveAddressMain;
                main.receiveAddressDetail = f.receiveAddressDetail;

                main.orderRemarks = f.orderRemarks;
                main.depositPersonNm = f.depositPersonNm;
                main.depositRemarks = f.depositRemarks;

                main.totalQty = this.totalQty;
                main.additionalShippingFee = this.additionalShippingFee || 0;
                // 최종 결제금액 = 상품합계 + 추가배송비 (기존과 동일)
                main.totalPrice = this.totalPrice + main.additionalShippingFee;
                main.sellerNo = SELLER_NO;

                return main;
            },

            async pay() {
                if (this.submitting) return;
                if (this.hasUnavailable) {
                    alert('주문할 수 없는 상품이 있습니다.\n' + this.unavailableText +
                          '\n장바구니에서 해당 상품을 빼고 다시 주문해 주세요.');
                    return;
                }
                if (!this.validate()) return;
                if (!confirm('해당내용으로 주문하시겠습니까?')) return;

                this.submitting = true;
                const payload = {
                    orderListMain: this.buildOrderListMain(),
                    orderListDetail: this.orderListDetail
                };
                const ret = await apiPost('/purchase/insertOrderList', { data: JSON.stringify(payload) });
                this.submitting = false;

                if (ret === 'not ok') {
                    alert('주문 오류가 발생하였습니다. 지속적으로 문제발생 시 크롬 브라우저를 이용하여 주문하시기 바랍니다.');
                    return;
                }
                if (ret === 'diff item') {
                    alert('존재하지 않는 상품이 있습니다. 장바구니를 비우고 다시 주문하시길 바랍니다.');
                    return;
                }
                if (ret === 'sold out') {
                    // 주문서를 열어 둔 사이에 품절 / 출하전으로 바뀐 경우
                    await this.checkItemStatus();
                    alert('품절되었거나 출하 전인 상품이 포함되어 있어 주문할 수 없습니다.' +
                          (this.unavailableText ? '\n' + this.unavailableText : ''));
                    return;
                }

                this.goComplete();
            },

            /** 주문완료 화면으로 이동 (재주문에 쓰이는 파라미터를 그대로 전달) */
            goComplete() {
                const f = this.form;
                const url = new URL(window.location.origin + '/purchase/purchase_complete');
                const set = function (k, v) { url.searchParams.set(k, v == null ? '' : v); };

                set('directItemNo', q('itemNo') || q('directItemNo'));
                set('directItemNm', q('itemNm') || q('directItemNm'));
                set('directItemPrice', q('itemPrice') || q('directItemPrice'));
                set('directItemPriceNum', q('itemPriceNum') || q('directItemPriceNum'));
                set('directQty', q('qty') || q('directQty'));
                set('directOptionNo', q('optionNo') || q('directOptionNo'));
                set('directOptionNm', q('optionNm') || q('directOptionNm'));
                set('directImagePath', q('imagePath') || q('directImagePath'));
                set('directShippingFee', q('shippingFee') || q('directShippingFee'));
                set('directShippingFeeNum', q('shippingFeeNum') || q('directShippingFeeNum'));
                set('directKeepingMethod', q('keepingMethod') || q('directKeepingMethod'));
                set('items', q('items'));

                set('orderPersonNm', f.orderPersonNm);
                set('orderTelno1', f.orderTelno1);
                set('orderTelno2', f.orderTelno2);
                set('orderTelno3', f.orderTelno3);
                set('orderRemarks', f.orderRemarks);

                set('sendPersonNm', f.sendPersonNm);
                set('sendTelno1', f.sendTelno1);
                set('sendTelno2', f.sendTelno2);
                set('sendTelno3', f.sendTelno3);
                set('sendZipNo', '');
                set('sendAddressMain', '');
                set('sendAddressDetail', '');

                window.location.href = url.href;
            }
        },

        async mounted() {
            const items = q('items');
            if (!isNull(items)) {
                this.buildFromCart(items);
            } else {
                await this.buildDirect();
            }

            await this.checkItemStatus();
            await this.loadUser();
            await this.loadSeller();
        }
    });

    registerLayout(app);
    app.config.compilerOptions.delimiters = ['[[', ']]'];
    app.mount('#purchase_app');
})();
