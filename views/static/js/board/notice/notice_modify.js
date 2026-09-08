/**
 * 알림마당 등록 / 수정 (Vue 3) — MDBootstrap / Bootstrap / jQuery 미사용
 *
 * 한 파일로 등록·수정을 모두 처리한다. noticeNo 가 있으면 수정 모드.
 * 저장 권한은 서버(관리자 전용)에서 최종 검증한다.
 */
(function () {
    const ctx = pageContext();
    const el = document.getElementById('notice_no');
    const noticeNo = el ? el.value : '';
    const isEdit = !!noticeNo;

    const app = Vue.createApp({
        data() {
            return {
                userNo: ctx.userNo,
                adminYn: ctx.adminYn,
                isEdit: isEdit,
                form: { noticeTitle: '', noticeContent: '' },
                submitting: false
            };
        },

        methods: {
            goList() { location.href = '/board/notice'; },

            async save() {
                if (isNull(this.form.noticeTitle)) { alert('제목을 입력하세요.'); return; }
                if (isNull(this.form.noticeContent)) { alert('내용을 입력하세요.'); return; }
                if (this.submitting) return;
                this.submitting = true;

                if (isEdit) {
                    await apiPost('/board/notice/updateNotice', {
                        noticeNo: noticeNo,
                        noticeTitle: this.form.noticeTitle,
                        noticeContent: this.form.noticeContent
                    });
                    alert('알림마당이 변경되었습니다.');
                } else {
                    await apiPost('/board/notice/insertNotice', {
                        noticeTitle: this.form.noticeTitle,
                        noticeContent: this.form.noticeContent
                    });
                    alert('알림마당이 저장되었습니다.');
                }
                this.submitting = false;
                location.href = '/board/notice';
            }
        },

        async mounted() {
            if (!isEdit) return;
            const ret = await apiPost('/board/notice/selectNoticeDetail', { noticeNo: noticeNo });
            if (ret && ret.length > 0) {
                this.form.noticeTitle = ret[0].noticeTitle || '';
                this.form.noticeContent = ret[0].noticeContent || '';
            }
        }
    });

    registerLayout(app);
    app.config.compilerOptions.delimiters = ['[[', ']]'];
    app.mount('#notice_editor_app');
})();
