/**
 * 알림마당 목록 (Vue 3) — MDBootstrap / Bootstrap / jQuery 미사용
 *
 * 기존 동작에서 바로잡은 점:
 *   기존에는 제목을 누르면 누구나 '수정' 화면으로 이동했다(고객 포함).
 *   이제 고객은 상세보기로, 수정은 관리자에게만 노출한다.
 */
(function () {
    const ctx = pageContext();

    const app = Vue.createApp({
        data() {
            return {
                userNo: ctx.userNo,
                adminYn: ctx.adminYn,
                notices: [],
                loading: true
            };
        },

        computed: {
            isAdmin() { return this.adminYn === 'Y'; }
        },

        methods: {
            openDetail(n) {
                location.href = '/board/notice/notice_detail?noticeNo=' + encodeURIComponent(n.noticeNo);
            },
            editNotice(n) {
                location.href = '/board/notice/notice_modify?noticeNo=' + encodeURIComponent(n.noticeNo);
            },
            goRegist() {
                location.href = '/board/notice/notice_regist';
            }
        },

        async mounted() {
            this.notices = (await apiPost('/board/notice/selectNoticeList', {})) || [];
            this.loading = false;
        }
    });

    registerLayout(app);
    app.config.compilerOptions.delimiters = ['[[', ']]'];
    app.mount('#notice_app');
})();
