/**
 * 회원 관리 (Vue 3) — MDBootstrap / Bootstrap / jQuery 미사용
 *
 * 기존 동작 유지:
 *  - 담당자(매니저) 지정: 휴대폰번호로 조회해 연결
 *  - 선택한 회원에게 SMS 발송 (전송 전 확인)
 *
 * 목록은 서버사이드로 100건씩 페이징한다.
 * (selectAllUser 에 pageSize/pageOffset 을 보내면 LIMIT ... OFFSET 으로 잘라 주고,
 *  전체 건수는 같은 응답의 totalCnt 로 함께 온다)
 *
 * 문자 발송 대상 선택은 지금 화면에 있는 페이지 안에서만 고른다.
 * 다른 페이지의 회원 정보는 브라우저에 없으므로 페이지를 옮기면 선택은 초기화된다.
 */
(function () {
    const ctx = pageContext();
    const PAGE_SIZE = 100;

    const app = Vue.createApp({
        data() {
            return {
                userNo: ctx.userNo,
                adminYn: ctx.adminYn,
                rows: [],          // 현재 페이지의 회원만 담는다
                total: 0,          // 전체 회원 수 (서버가 알려준다)
                loading: true,
                page: 1,
                pageSize: PAGE_SIZE,
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
                return this.rows.length > 0 && this.rows.every((r) => this.selected[r.userNo]);
            }
        },
        methods: {
            async load(reset) {
                if (reset) this.page = 1;
                this.loading = true;
                this.selected = {};

                const res = await apiPostFull('/user/selectAllUser', {
                    pageSize: this.pageSize,
                    pageOffset: (this.page - 1) * this.pageSize
                });

                this.rows = res.ret || [];
                this.total = res.totalCnt || 0;
                this.loading = false;
            },

            toggleAll(e) {
                const next = e.target.checked;
                const sel = {};
                if (next) this.rows.forEach((r) => { sel[r.userNo] = true; });
                this.selected = sel;
            },

            async goPage(p) {
                this.page = p;
                window.scrollTo({ top: 0, behavior: 'smooth' });
                await this.load(false);
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
