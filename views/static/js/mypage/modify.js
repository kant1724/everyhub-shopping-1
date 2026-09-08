/**
 * 주문내역 수정 (Vue 3) — MDBootstrap / Bootstrap / jQuery 미사용
 *
 * 기존 로직 유지:
 *  - orderNo 로 주문을 불러와 폼을 채운다
 *  - '보내는자 입력' 체크가 꺼져 있으면 보내는자 항목은 모두 빈 값으로 전송
 *    (기존 updateOrderList 동작 그대로)
 *  - gubun === 'order_list' 이면 관리자 경로(updateOrderListByAdmin) 로 저장하고
 *    저장 후 /admin/order_list 로, 아니면 /mypage 로 이동
 *  - 검증 항목·문구, 변경 확인 confirm 동일
 *
 * 델리미터는 [[ ]].
 */
(function () {
    const ctx = pageContext();
    const el = function (id) { return document.getElementById(id); };
    const orderNo = el('order_no') ? el('order_no').value : '';
    const gubun = el('gubun') ? el('gubun').value : '';
    const isAdminPath = gubun === 'order_list';

    const app = Vue.createApp({
        data() {
            return {
                userNo: ctx.userNo,
                adminYn: ctx.adminYn,
                orderNo: orderNo,
                loading: true,
                submitting: false,

                hasSender: false,
                addressOpen: false,
                addressTarget: 'receive',   // 'send' | 'receive'

                form: {
                    orderPersonNm: '',
                    orderTelno1: '', orderTelno2: '', orderTelno3: '',
                    orderZipNo: '', orderAddressMain: '', orderAddressDetail: '',
                    orderRemarks: '',

                    senderSame: false,
                    sendPersonNm: '',
                    sendTelno1: '', sendTelno2: '', sendTelno3: '',
                    sendZipNo: '', sendAddressMain: '', sendAddressDetail: '',

                    receiverSame: false,
                    receivePersonNm: '',
                    receiveTelno1: '', receiveTelno2: '', receiveTelno3: '',
                    receiveZipNo: '', receiveAddressMain: '', receiveAddressDetail: '',

                    depositWho: '',
                    depositPersonNm: '',
                    depositRemarks: ''
                }
            };
        },

        methods: {
            advance(e, len, nextRef) {
                if (String(e.target.value).length >= len && this.$refs[nextRef]) {
                    this.$refs[nextRef].focus();
                }
            },

            orderInfoFilled() {
                const f = this.form;
                return !isNull(f.orderPersonNm) && !isNull(f.orderTelno1) &&
                       !isNull(f.orderTelno2) && !isNull(f.orderTelno3);
            },

            onSenderSame(e) {
                if (!e.target.checked) { this.form.senderSame = false; return; }
                if (!this.orderInfoFilled()) {
                    alert('주문자 정보를 입력하세요.');
                    this.form.senderSame = false;
                    return;
                }
                const f = this.form;
                f.senderSame = true;
                f.sendPersonNm = f.orderPersonNm;
                f.sendTelno1 = f.orderTelno1;
                f.sendTelno2 = f.orderTelno2;
                f.sendTelno3 = f.orderTelno3;
                f.sendZipNo = f.orderZipNo;
                f.sendAddressMain = f.orderAddressMain;
                f.sendAddressDetail = f.orderAddressDetail;
            },

            onReceiverSame(e) {
                if (!e.target.checked) { this.form.receiverSame = false; return; }
                if (!this.orderInfoFilled()) {
                    alert('주문자 정보를 입력하세요.');
                    this.form.receiverSame = false;
                    return;
                }
                const f = this.form;
                f.receiverSame = true;
                f.receivePersonNm = f.orderPersonNm;
                f.receiveTelno1 = f.orderTelno1;
                f.receiveTelno2 = f.orderTelno2;
                f.receiveTelno3 = f.orderTelno3;
                f.receiveZipNo = f.orderZipNo;
                f.receiveAddressMain = f.orderAddressMain;
                f.receiveAddressDetail = f.orderAddressDetail;
            },

            onOrderInfoChanged() {
                const f = this.form;
                if (f.senderSame) {
                    f.sendPersonNm = f.orderPersonNm;
                    f.sendTelno1 = f.orderTelno1;
                    f.sendTelno2 = f.orderTelno2;
                    f.sendTelno3 = f.orderTelno3;
                }
                if (f.receiverSame) {
                    f.receivePersonNm = f.orderPersonNm;
                    f.receiveTelno1 = f.orderTelno1;
                    f.receiveTelno2 = f.orderTelno2;
                    f.receiveTelno3 = f.orderTelno3;
                }
            },

            pickDepositWho(who) {
                const f = this.form;
                f.depositWho = who;
                if (who === 'order') f.depositPersonNm = f.orderPersonNm;
                else if (who === 'send') f.depositPersonNm = f.sendPersonNm;
                else if (who === 'receive') f.depositPersonNm = f.receivePersonNm;
            },

            openAddress(target) {
                this.addressTarget = target;
                this.addressOpen = true;
            },

            onAddressSelected(row) {
                if (this.addressTarget === 'send') {
                    this.form.sendZipNo = row.zipNo;
                    this.form.sendAddressMain = row.addr;
                } else {
                    this.form.receiveZipNo = row.zipNo;
                    this.form.receiveAddressMain = row.addr;
                }
                this.addressOpen = false;
            },

            /** 기존 검증 순서·문구 그대로 */
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

            async load() {
                const ret = await apiPost('/admin/order_list/selectOrderListMainByOrderNo', { orderNo: this.orderNo });
                this.loading = false;
                if (!ret || ret.length === 0) return;
                const o = ret[0];
                const f = this.form;

                f.orderPersonNm = o.orderPersonNm || '';
                f.orderTelno1 = o.orderTelno1 || '';
                f.orderTelno2 = o.orderTelno2 || '';
                f.orderTelno3 = o.orderTelno3 || '';
                f.orderRemarks = o.orderRemarks || '';

                // 보내는자 정보가 있으면 입력란을 펼친다 (기존 has_sender 자동 체크와 동일)
                this.hasSender = !isNull(o.sendPersonNm);
                f.sendPersonNm = o.sendPersonNm || '';
                f.sendTelno1 = o.sendTelno1 || '';
                f.sendTelno2 = o.sendTelno2 || '';
                f.sendTelno3 = o.sendTelno3 || '';
                f.sendZipNo = o.sendZipNo || '';
                f.sendAddressMain = o.sendAddressMain || '';
                f.sendAddressDetail = o.sendAddressDetail || '';

                f.receivePersonNm = o.receivePersonNm || '';
                f.receiveTelno1 = o.receiveTelno1 || '';
                f.receiveTelno2 = o.receiveTelno2 || '';
                f.receiveTelno3 = o.receiveTelno3 || '';
                f.receiveZipNo = o.receiveZipNo || '';
                f.receiveAddressMain = o.receiveAddressMain || '';
                f.receiveAddressDetail = o.receiveAddressDetail || '';

                f.depositPersonNm = o.depositPersonNm || '';
                f.depositRemarks = o.depositRemarks || '';
            },

            async save() {
                if (!this.validate()) return;
                if (!confirm('해당내용으로 변경 하시겠습니까?')) return;
                if (this.submitting) return;
                this.submitting = true;

                const f = this.form;
                const main = {
                    orderNo: this.orderNo,
                    orderPersonNm: f.orderPersonNm,
                    orderTelno: f.orderTelno1 + f.orderTelno2 + f.orderTelno3,
                    orderTelno1: f.orderTelno1,
                    orderTelno2: f.orderTelno2,
                    orderTelno3: f.orderTelno3,
                    // 체크가 꺼져 있으면 보내는자는 전부 빈 값 (기존 동작)
                    sendPersonNm: '', sendTelno: '', sendTelno1: '', sendTelno2: '', sendTelno3: '',
                    sendZipNo: '', sendAddressMain: '', sendAddressDetail: '',
                    receivePersonNm: f.receivePersonNm,
                    receiveTelno: f.receiveTelno1 + f.receiveTelno2 + f.receiveTelno3,
                    receiveTelno1: f.receiveTelno1,
                    receiveTelno2: f.receiveTelno2,
                    receiveTelno3: f.receiveTelno3,
                    receiveZipNo: f.receiveZipNo,
                    receiveAddressMain: f.receiveAddressMain,
                    receiveAddressDetail: f.receiveAddressDetail,
                    orderRemarks: f.orderRemarks,
                    depositPersonNm: f.depositPersonNm,
                    depositRemarks: f.depositRemarks
                };

                if (this.hasSender) {
                    main.sendPersonNm = f.sendPersonNm;
                    main.sendTelno = f.sendTelno1 + f.sendTelno2 + f.sendTelno3;
                    main.sendTelno1 = f.sendTelno1;
                    main.sendTelno2 = f.sendTelno2;
                    main.sendTelno3 = f.sendTelno3;
                    main.sendZipNo = f.sendZipNo;
                    main.sendAddressMain = f.sendAddressMain;
                    main.sendAddressDetail = f.sendAddressDetail;
                }

                const url = isAdminPath ? '/mypage/updateOrderListByAdmin' : '/mypage/updateOrderList';
                await apiPost(url, { data: JSON.stringify({ orderListMain: main }) });
                this.submitting = false;

                alert('내용이 수정되었습니다.');
                location.href = isAdminPath ? '/admin/order_list/' : '/mypage/';
            },

            goBack() {
                location.href = isAdminPath ? '/admin/order_list/' : '/mypage/';
            }
        },

        async mounted() {
            await this.load();
        }
    });

    registerLayout(app);
    app.config.compilerOptions.delimiters = ['[[', ']]'];
    app.mount('#modify_app');
})();
