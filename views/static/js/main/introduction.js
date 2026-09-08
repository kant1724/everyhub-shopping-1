/**
 * 농장소개 (Vue 3) — MDBootstrap / Bootstrap / jQuery 미사용
 * 관리자 화면에서 저장한 소개글을 그대로 보여준다.
 */
(function () {
    const ctx = pageContext();

    const app = Vue.createApp({
        data() {
            return { userNo: ctx.userNo, adminYn: ctx.adminYn, text: "", loading: true };
        },
        methods: {
            goCart() { location.href = "/cart"; }
        },
        async mounted() {
            const ret = await apiPost("/admin/introduction_manager/selectIntroduction", {});
            if (ret && ret.length > 0) this.text = ret[0].introductionText || "";
            this.loading = false;
        }
    });

    registerLayout(app);
    app.config.compilerOptions.delimiters = ["[[", "]]"];
    app.mount("#intro_app");
})();
