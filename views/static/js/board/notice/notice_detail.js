/**
 * 알림마당 상세 (Vue 3) — MDBootstrap / Bootstrap / jQuery 미사용
 */
(function () {
    const ctx = pageContext();
    const el = document.getElementById('notice_no');
    const noticeNo = el ? el.value : '';

    const app = Vue.createApp({
        data() {
            return {
                userNo: ctx.userNo,
                adminYn: ctx.adminYn,
                notice: null,
                loading: true
            };
        },

        computed: {
            isAdmin() { return this.adminYn === 'Y'; }
        },

        methods: {
            goList() { location.href = '/board/notice'; },
            edit() {
                location.href = '/board/notice/notice_modify?noticeNo=' + encodeURIComponent(noticeNo);
            }
        },

        async mounted() {
            const ret = await apiPost('/board/notice/selectNoticeDetail', { noticeNo: noticeNo });
            if (ret && ret.length > 0) this.notice = ret[0];
            this.loading = false;
        }
    });

    registerLayout(app);
    app.config.compilerOptions.delimiters = ['[[', ']]'];
    app.mount('#notice_detail_app');
})();
