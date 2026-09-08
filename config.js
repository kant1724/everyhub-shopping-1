// JWT_SECRET must be set in production. If it is not set, a random secret is
// generated per process start so a hardcoded/known key can never be used to
// forge tokens; this intentionally invalidates any previously issued token
// on restart.
const secret = process.env.JWT_SECRET || require('crypto').randomBytes(48).toString('hex');

if (!process.env.JWT_SECRET) {
	console.warn('[config] JWT_SECRET is not set; generated a temporary random secret for this process.');
}

module.exports = {
	'secret': secret
};
