/**
 * 소개글 관리 (Vue 3) — MDBootstrap / Bootstrap / jQuery 미사용
 * 여기서 저장한 내용이 공개 페이지(/introduction) 에 그대로 노출된다.
 */
(function () {
    const ctx = pageContext();

    const app = Vue.createApp({
        data() {
            return { userNo: ctx.userNo, adminYn: ctx.adminYn, text: '', loading: true, saving: false };
        },
        methods: {
            async save() {
                if (this.saving) return;
                this.saving = true;
                await apiPost('/admin/introduction_manager/saveIntroduction', { introductionText: this.text });
                this.saving = false;
                alert('농장소개가 등록되었습니다.');
            }
        },
        async mounted() {
            const ret = await apiPost('/admin/introduction_manager/selectIntroduction', {});
            if (ret && ret.length > 0) this.text = ret[0].introductionText || '';
            this.loading = false;
        }
    });

    registerLayout(app);
    app.config.compilerOptions.delimiters = ['[[', ']]'];
    app.mount('#intro_mgr_app');
})();
