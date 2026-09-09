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

/**
 * 업로드 전에 사진을 웹에서 쓸 크기로 줄인다.
 *
 * 스마트폰 사진은 4032x3024 원본이라 한 장에 2~7MB 가 나온다. 그대로 올리면
 * 상품 상세와 갤러리를 여는 모든 방문자가 그 원본을 내려받는다. 화면에서
 * 실제로 쓰이는 크기는 아무리 커도 긴 변 1600px 이면 충분하다.
 *
 * 업로드 서버(upload_image_from_shopping_1)가 파일을 .jpg 로 저장하므로
 * 출력도 JPEG 로 고정한다. WebP 로 바꾸면 서버 쪽 확장자 처리도 함께 고쳐야 한다.
 *
 * 어떤 이유로든 변환에 실패하면 원본 File 을 그대로 돌려준다. 사진을 줄이려다
 * 관리자가 상품을 저장하지 못하는 상황이 더 나쁘기 때문이다.
 */
async function resizeImageFile(file, options) {
	const opt = options || {};
	const maxEdge = opt.maxEdge || 1600;
	const quality = opt.quality || 0.82;

	if (!file || !file.type || file.type.indexOf('image/') !== 0) return file;
	if (file.type === 'image/gif') return file;   // 다시 그리면 애니메이션이 깨진다

	try {
		const src = await loadImageForResize(file);
		const scale = Math.min(1, maxEdge / Math.max(src.width, src.height));

		// 이미 작고 가벼우면 다시 굽지 않는다. JPEG 재압축은 손실만 더한다.
		if (scale === 1 && file.size <= 700 * 1024) {
			if (src.close) src.close();
			return file;
		}

		const w = Math.round(src.width * scale);
		const h = Math.round(src.height * scale);
		const canvas = document.createElement('canvas');
		canvas.width = w;
		canvas.height = h;

		const ctx = canvas.getContext('2d');
		// PNG 투명 영역이 JPEG 에서 검게 나오지 않도록 흰 바탕을 먼저 깐다
		ctx.fillStyle = '#ffffff';
		ctx.fillRect(0, 0, w, h);
		ctx.drawImage(src, 0, 0, w, h);
		if (src.close) src.close();

		const blob = await new Promise(function (resolve) {
			canvas.toBlob(resolve, 'image/jpeg', quality);
		});
		// 오히려 커졌다면 원본이 낫다 (이미 잘 압축된 사진)
		if (!blob || blob.size >= file.size) return file;

		return new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
	} catch (e) {
		return file;
	}
}

/**
 * 리사이즈용으로 이미지를 읽는다.
 *
 * createImageBitmap 의 imageOrientation:'from-image' 를 쓰는 이유: 캔버스에 다시
 * 그리면 EXIF 회전 정보가 사라져서, 세로로 찍은 폰 사진이 눕게 나온다.
 * 이 옵션이 없는 브라우저에서는 <img> 로 폴백한다(최신 브라우저는 <img> 렌더링에
 * EXIF 방향을 이미 반영한다).
 */
function loadImageForResize(file) {
	if (window.createImageBitmap) {
		try {
			return createImageBitmap(file, { imageOrientation: 'from-image' })
				.catch(function () { return loadImageViaTag(file); });
		} catch (e) { /* 아래 폴백으로 */ }
	}
	return loadImageViaTag(file);
}

function loadImageViaTag(file) {
	return new Promise(function (resolve, reject) {
		const url = URL.createObjectURL(file);
		const img = new Image();
		img.onload = function () { URL.revokeObjectURL(url); resolve(img); };
		img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('image load failed')); };
		img.src = url;
	});
}