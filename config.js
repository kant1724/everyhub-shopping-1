// 토큰 서명 키. 소스에 박아두면 그 값으로 토큰을 위조할 수 있으므로 넣지 않는다.
// 환경변수가 있으면 그것을 쓰고, 없으면 secrets.js 가 secrets.json 에 만들어 둔
// 값을 쓴다. 매번 새로 만들면 재시작할 때마다 발급된 토큰이 모두 무효가 된다.
const secret = require('./server/common/secrets').get('JWT_SECRET');

module.exports = {
	'secret': secret
};
