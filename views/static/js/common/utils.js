function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function isNull(x) {
	if (x == null || x == '') {
		return true;
	}
	return false;
}