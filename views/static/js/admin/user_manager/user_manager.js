/**
 * 회원 관리 (Vue 3) — MDBootstrap / Bootstrap / jQuery 미사용
 *
 * 기존 동작 유지:
 *  - lastUserNo + limit 배치 조회 (더보기)
 *  - 담당자(매니저) 지정: 휴대폰번호로 조회해 연결
 *  - 선택한 회원에게 SMS 발송 (전송 전 확인)
 */
(function () {
    const ctx = pageContext();
    const BATCH = 150;

    const app = Vue.createApp({
        data() {
            return {
                userNo: ctx.userNo,
                adminYn: ctx.adminYn,
                rows: [],
                lastNo: 99999999,
                hasMore: true,
                loading: true,
                selected: {},
                managerModal: false,
                managerTarget: null,
                managerTelno: '',
                smsModal: false,
                smsSubject: '',
                smsContent: '',
                sending: false
            };
        },
        computed: {
            selectedTelnos() {
                return this.rows.filter((r) => this.selected[r.userNo]).map((r) => r.telno);
            },
            allChecked() {
                return this.rows.length > 0 && this.selectedTelnos.length === this.rows.length;
            }
        },
        methods: {
            async load(reset) {
                if (reset) { this.rows = []; this.lastNo = 99999999; this.hasMore = true; this.selected = {}; }
                this.loading = true;
                const ret = await apiPost('/user/selectAllUser', { lastUserNo: this.lastNo, limit: BATCH });
                const list = ret || [];
                if (list.length > 0) {
                    this.rows = this.rows.concat(list);
                    this.lastNo = list[list.length - 1].userNo;
                }
                this.hasMore = list.length >= BATCH;
                this.loading = false;
            },

            toggleAll(e) {
                const next = e.target.checked;
                const sel = {};
                if (next) this.rows.forEach((r) => { sel[r.userNo] = true; });
                this.selected = sel;
            },

            openManager(r) {
                this.managerTarget = r;
                this.managerTelno = '';
                this.managerModal = true;
            },

            async saveManager() {
                if (isNull(this.managerTelno)) { alert('휴대폰 번호를 입력하세요.'); return; }
                const ret = await apiPost('/admin/user_manager/updateManagerNo', {
                    userNo: this.managerTarget.userNo,
                    managerTelno: this.managerTelno
                });
                if (ret === 'not ok') {
                    alert('해당 휴대폰 번호로 등록된 매니저가 없습니다.');
                    return;
                }
                alert('업데이트가 완료되었습니다.');
                this.managerModal = false;
                await this.load(true);
            },

            openSms() {
                if (this.selectedTelnos.length === 0) { alert('문자를 보낼 회원을 선택하세요.'); return; }
                this.smsSubject = '';
                this.smsContent = '';
                this.smsModal = true;
            },

            async sendSms() {
                if (isNull(this.smsContent)) { alert('내용을 입력하세요.'); return; }
                if (!confirm('문자메세지를 전송하시겠습니까?')) return;
                if (this.sending) return;
                this.sending = true;
                await apiPost('/admin/user_manager/sendSMS', {
                    smsSubject: this.smsSubject,
                    smsContent: this.smsContent,
                    smsTelno: this.selectedTelnos.join(';')
                });
                this.sending = false;
                alert('문자가 정상적으로 발송되었습니다.');
                this.smsModal = false;
            }
        },
        async mounted() { await this.load(true); }
    });

    registerLayout(app);
    app.config.compilerOptions.delimiters = ['[[', ']]'];
    app.mount('#user_mgr_app');
})();
