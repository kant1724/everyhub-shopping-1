/** 개인정보처리방침 — 정적 문서에 공용 헤더/푸터만 적용 */
(function () {
    const ctx = pageContext();
    const app = Vue.createApp({
        data() { return { userNo: ctx.userNo, adminYn: ctx.adminYn }; }
    });
    registerLayout(app);
    app.config.compilerOptions.delimiters = ["[[", "]]"];
    app.mount("#policy_app");
})();
