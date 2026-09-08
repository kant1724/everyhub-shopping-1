function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function isNull(x) {
	if (x == null || x == '') {
		return true;
	}
	return false;
}

/**
 * Escape a value before it is concatenated into an HTML string.
 *
 * Review subjects, Q&A bodies, notice titles and item names are written by
 * users and rendered with string concatenation + .append(), so an unescaped
 * value like <img src=x onerror=...> would execute in every visitor's
 * browser (including an administrator's). Always wrap user-supplied text
 * with escapeHtml() when building markup.
 */
function escapeHtml(x) {
	if (x == null) {
		return '';
	}
	return String(x)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/**
 * Same as escapeHtml(), but keeps author line breaks as <br>.
 * Use for multi-line bodies (item descriptions, notice/QnA content).
 */
function escapeHtmlWithBreaks(x) {
	return escapeHtml(x).replace(/\r\n|\r|\n/g, '<br>');
}