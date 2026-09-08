module.exports = {
	numberWithCommas: function(x) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	},

	// Coerces a value to a safe integer for use in raw (${}) SQL substitution.
	// Returns null (-> SQL NULL) for anything that is not a clean integer,
	// so no attacker-controlled characters ever reach the query string.
	toSafeInt: function(value) {
		if (value === undefined || value === null || value === '') return null;
		if (Array.isArray(value)) return value.map(module.exports.toSafeInt);
		let n = Number(value);
		return Number.isInteger(n) ? n : null;
	}
};
