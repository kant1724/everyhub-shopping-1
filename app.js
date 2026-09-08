let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let engines = require('consolidate');

let app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'views')));
app.engine('html', engines.mustache);
app.set('view engine', 'html');
let session = require('express-session');

// The session secret signs the cookie that carries userNo/adminYn. A value
// committed to source can be used to forge an admin session, so it comes from
// the environment; without it a random per-process secret is used instead.
const sessionSecret = process.env.SESSION_SECRET || require('crypto').randomBytes(48).toString('hex');
if (!process.env.SESSION_SECRET) {
    console.warn('[app] SESSION_SECRET is not set; generated a temporary random secret for this process.');
}

app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        // opt-in: only enable once the site is served over HTTPS, otherwise
        // the browser would stop sending the cookie and logins would break
        secure: process.env.COOKIE_SECURE === 'true',
        maxAge: 1000 * 60 * 60 * 12
    }
}));

const config = require('./config')
app.set('jwt-secret', config.secret)

app.use('/', require('./server/main/mainRouter'));
app.use('/cart', require('./server/cart/cartRouter'));
app.use('/product', require('./server/product/productRouter'));
app.use('/purchase', require('./server/purchase/purchaseRouter'));
app.use('/mypage', require('./server/mypage/mypageRouter'));
app.use('/admin/gallery_manager', require('./server/admin/gallery_manager/galleryManagerRouter'));
app.use('/admin/item_manager', require('./server/admin/item_manager/itemManagerRouter'));
app.use('/admin/introduction_manager', require('./server/admin/introduction_manager/introductionManagerRouter'));
app.use('/admin/order_list', require('./server/admin/order_list/orderListRouter'));
app.use('/admin/user_manager', require('./server/admin/user_manager/userManagerRouter'));
app.use('/admin/delivery_manager', require('./server/admin/delivery_manager/deliveryManagerRouter'));
app.use('/board/notice', require('./server/board/notice/noticeRouter'));
app.use('/user', require('./server/user/userRouter'));

module.exports = app;
